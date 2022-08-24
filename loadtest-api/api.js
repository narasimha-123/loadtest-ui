const express = require('express');
const app = express();
global.__basedir = __dirname;
const path = require('path');
const config = require('./config');

// logger
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__basedir, '/apiLogFile.log') })
    ]
});
logger.info('Starting service, Timestamp: ', Date.now());

process.on("uncaughtException", (err) => {
    logger.info("UNCAUGHT EXCEPTION, APP SHUTTING NOW!!");
    logger.info(err.message, err.name);
    process.exit(1);
});

// multer config : middleware for uploading files 
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './files')
    },
})
const upload = multer({ storage: storage });

// general imports
const cors = require('cors');
const mongoose = require('mongoose');
const testdb = require('./models/loadTestDB');
const hf = require('./helperFunctions');
const { spawn } = require('child_process');
const fs = require('fs');

// bull config
const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const redisHost = process.env.REDIS_HOST || config.REDIS_HOST;
const redisPort = process.env.REDIS_PORT || config.REDIS_PORT;
const queueName = config.QUEUE_NAME;
const JobQueue = new Queue(queueName, { redis: { port: redisPort, host: redisHost } });
const serverAdapter = new ExpressAdapter();
createBullBoard({
    queues: [
        new BullAdapter(JobQueue),
    ],
    serverAdapter: serverAdapter
});
serverAdapter.setBasePath('/admin/queues'); // An arbitrary path to serve the dashboard
app.use('/admin/queues', serverAdapter.getRouter());

// DB connection
const dbURL = config.DB_URL;
mongoose.connect(dbURL).catch((err) => {
    logger.info("Error establishing connection to DB");
    logger.info(err);
})
const dbConnection = mongoose.connection
dbConnection.on('open', () => {
    logger.info('DB connected')
}).on('error', err => {
    logger.info("DB Error");
    logger.info(err);
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function updateStatus(id, results, status) {
    if (results) {
        logger.info("Updating status of " + id + " to " + status)
        return testdb.updateOne({ _id: id }, { status: status, testResults: results }).then((result) => {
            logger.info("Status Update Response:");
            logger.info(result);
        });
    }
    else {
        logger.info("Updating status of " + id + " to " + status)
        return testdb.updateOne({ _id: id }, { status: status }).then((result) => {
            logger.info("Status Update Response:");
            logger.info(result);
        });
    }
}

async function updateError(id, err) {
    return testdb.updateOne({ _id: id }, { error: err }).then((result) => {
        logger.info("Error Update Response:");
        logger.info(result);
    });
}

app.get('/api/tests', async (req, res) => {
    try {
        if (req.query.status) {
            logger.info("GET REQUEST Status given" + req.query.status);
            let tests = await testdb.find({ status: req.query.status }, {}, { sort: { 'updatedAt': -1 } });
            if (req.query.status.includes("Running")) {
                let runningTest = tests.findIndex(element => element.status == 'Running');
                if (runningTest != -1) {
                    let job = await JobQueue.getActive();
                    tests[runningTest].progress = job[0].progress();
                }
            }
            res.status(200).json(tests);
        } else {
            logger.info("GET REQUEST No status")
            const tests = await testdb.find({}, {}, { sort: { 'updatedAt': -1 } });
            logger.info(tests.length);
            res.status(200).json(tests);
        }
    }
    catch (err) {
        logger.info('get: ' + err);
        res.status(500).send('Error: ' + err);
    }
});

app.post('/api/tests', upload.array('customFile', 1), async (req, res) => {

    // Checking if the job queue limit is met
    try {
        const jobCounts = await JobQueue.getJobCounts();
        if (jobCounts.waiting > 4) {
            // cant accept test
            logger.info('Waiting: ' + jobCounts.waiting);
            res.status(503).send({
                recieved: true,
                processing: false,
                // processed: false,
                // transfered: false,
                // savedResults: false,
                error: "Queue Full"
            });
            return;
        }
    }
    catch (err) {
        logger.info('POST::SVR_ERROR: ' + err);
        res.status(500).send({
            recieved: true,
            processing: false,
            // processed: false,
            // transfered: false,
            // savedResults: false,
            error: 'POST::SVR_ERROR: ' + err
        });
        return;
    }

    // creating global object test
    const test = new testdb({
        testName: req.body.testName,
        createdBy: req.body.createdBy,
        rps: req.body.rps,
        users: req.body.users,
        time: req.body.time,
        env: req.body.env,
        langFeature: req.body.langFeature,
        input: req.body.input
    });
    let filename = '';

    // check value contraints
    if (parseInt(test.rps) > 1000 || parseInt(test.users) > 1000 || 
        parseInt(test.time) > 1000 || parseInt(test.rps) < 1 || 
        parseInt(test.users) < 1 || parseInt(test.time) < 1) {
        logger.info('POST::CLIENT_ERROR: Invalid test parameters');
        res.status(400).send({
            recieved: true,
            processing: false,
            // processed: false,
            // transfered: false,
            // savedResults: false,
            error: 'POST::SVR_ERROR: : Invalid test parameters'
        });
        return;
    }
    // check for custom
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            logger.info("No input file");
        }
        else {
            logger.info("File Present");
            filename = req.files[0].filename;
            test.input = `loadTestUI/inputs/custom/${test._id}/input.txt`;
            test.customFile.data = fs.readFileSync(req.files[0].path);
        }
    }
    catch (err) {
        logger.info('POST::SVR_ERROR custom file chech failed: ' + err);
        res.status(500).send({
            test_id: test._id,
            recieved: true,
            processing: false,
            // processed: false,
            // transfered: false,
            // savedResults: false,
            error: 'POST::SVR_ERROR custom file chech failed: ' + err
        });
        return;
    }

    // saving test in DB
    try {
        const saveTestResponse = await test.save();
        res.status(202).send({
            recieved: true,
            processing: true,
            // processed: true,
            // transfered: true,
            // savedResults: false,
            // error: true
        });
    }
    catch (err) {
        logger.info('POST::SVR_ERROR DB Unreachable: ' + err);
        res.status(504).send({
            test_id: test._id,
            recieved: true,
            processing: false,
            // processed: false,
            // transfered: false,
            // savedResults: false,
            error: 'POST::SVR_ERROR DB Unreachable: ' + err
        });
        return;
    }

    if (test.customFile.data) {
        // move files
        try {
            const dir = path.join(__basedir, 'files', )+`/${test._id}/`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            };
            const oldPath = path.join(__basedir, 'files', filename);
            const newPath = dir + 'input.json';

            fs.renameSync(oldPath, newPath);

        } catch (e) {
            logger.info("Moving input file failed " + e);
            const updateResponse = await updateStatus(test._id, null, "Error");
            await updateError(test._id, "Moving input file failed " +e);
            return;
        }

        // create and upload files
        try {
            const url = {
                "custom_ner": "/20210101/actions/batchDetectLanguageEntities",
                "custom_txtc": "/20210101/actions/batchDetectLanguageTextClassification"
            };
            const content = "file|url\n" + `"/home/opc/loadTestUI/inputs/custom/${test._id}/input.json"|"${url[test.langFeature]}"`;
            fs.writeFileSync(path.join(__basedir, 'files', (test._id).toString(), 'input.txt'), content);
            logger.info("Uploading input files");
            const from = path.join(__basedir, 'files', (test._id).toString());
            const to = `/home/opc/loadTestUI/inputs/custom/${test._id}`;
            await hf.scpDir(from, to);
            logger.info("Upload complete");

        } catch (e) {
            logger.info("Creating input file failed");
            const updateResponse = await updateStatus(test._id, null, "Error");
            await updateError(test._id, "Creating input txt file failed " +e);
            return;
        }
    }

    // Adding job to queue, PRODUCER code here
    try {
        const taskOpts = {
            attempts: 1,
            // removeOnComplete: true,
            // removeOnFail: true
        }
        const job = await JobQueue.add({
            testId: test._id,
            testName: test.testName
        }, taskOpts);
        logger.info("Job with name: " + test.testName + " added to queue");
        // res.status(200).send({
        //     recieved: true,
        //     processing: false,
        //     processed: true,
        //     transfered: true,
        //     // savedResults: false,
        //     // error: true
        // });
    } catch (err) {
        // res.status(500).send({
        //     recieved: true,
        //     processing: false,
        //     processed: true,
        //     transfered: false,
        //     // savedResults: false,
        //     error: true
        // });
        logger.info("Adding to queue failed");
        const updateResponse = await updateStatus(test._id, null, "Error");
        await updateError(test._id, "Adding to queue failed"+err);
        return;
    }

});

app.get('/api/tests/:id', async (req, res) => {
    try {
        // Reading isbn from the URL
        const id = req.params.id;
        logger.info(id);
        const test = await testdb.findOne({ _id: id });
        logger.info(test);
        res.status(200).json(test);
    }
    catch (err) {
        logger.info('get: ' + err);
        res.status(500).send('Error: ' + err);
    }
});

app.get('/api/tests/:id/result', async (req, res) => {
    try {
        // Reading id from the URL
        const id = req.params.id;
        logger.info(id);
        const test = await testdb.findOne({ _id: id });
        // logger.info(test);

        if (test.test_folder === '') {
            throw "Test Folder Not Found"
        }
        if (fs.existsSync(path.join(__basedir, 'results', (test._id).toString()+".zip"))) {
            res.status(200).download(path.join(__basedir, 'results', (test._id).toString()+".zip"));
        }
        else {
            logger.info("Zip not found");
            if (fs.existsSync(path.join(__basedir, 'results', (test._id).toString()+".zip")+'/')) {
                let command = "sh"
                const child = spawn(command, ['zip.sh', (test._id).toString()]);
                logger.info("child: " + child.pid);
                child.stdout.setEncoding('utf8');
                child.stdout.on('data', (result) => {
                    // data from the standard output is here as buffers
                    logger.info(result);
                });
                child.on('close', (code) => {
                    logger.info("Folder zipped");
                    logger.info(`child process exited with code ${code}`);
                    res.status(200).download(path.join(__basedir, 'results', (test._id).toString()+".zip"));
                });
            }
            else {
                let command = "sh"
                const child = spawn(command, ['download.sh', (test._id).toString()]);
                logger.info("child: " + child.pid);
                child.stdout.setEncoding('utf8');
                child.stdout.on('data', (result) => {
                    // data from the standard output is here as buffers
                    logger.info(result);
                });
                child.on('close', (code) => {
                    logger.info("File downloaded from remote");
                    logger.info(`child process exited with code ${code}`);
                    res.status(200).download(path.join(__basedir, 'results', (test._id).toString()+".zip"));
                });
            }
        }
    }
    catch (err) {
        logger.info('get: ' + err);
        res.status(500).send('Error: ' + err);
    }
});

app.delete('/api/tests/:id', async (req, res) => {
    try {
        // Reading isbn from the URL
        const id = req.params.id;
        logger.info(id);
        const test = await testdb.findOneAndDelete({ _id: id });
        if (!test) {
            res.send('No such test')
        }
        else {
            logger.info(test);

            if (fs.existsSync(path.join(__basedir, 'results', (test._id).toString()+".zip"))) {
                //delete zip
                const child = spawn("sh", ['deleteLocalZip.sh', folderToDelete]);
                logger.info("child: " + child.pid);
                child.stdout.setEncoding('utf8');
                child.stdout.on('data', (result) => {
                    // data from the standard output is here as buffers
                    logger.info(result);
                });
                child.on('exit', (code) => {
                    logger.info("Zip deleted on local");
                    logger.info(`child process exited with code ${code}`);
                });
            }

            let command = "node"
            const child = spawn(command, ['delete.js', (test._id).toString()]);
            logger.info("child: " + child.pid);
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', (result) => {
                // data from the standard output is here as buffers
                logger.info(result);
            });
            child.on('exit', (code) => {
                logger.info("Test results deletion exit");
                logger.info(`child process exited with code ${code}`);
                res.status(200).send('Test deleted');
            });

        }
    }
    catch (err) {
        logger.info('get: ' + err);
        res.status(500).send('Error deleting files: ' + err);
    }
});

const port = config.API_PORT;
app.listen(port, () => logger.info(`App listening on port ${port}!`));