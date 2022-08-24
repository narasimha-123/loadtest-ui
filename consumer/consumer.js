// config
const config = require('./config.js');
global.__basedir = __dirname;
const path = require('path');

// logger
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__basedir, '/consumerLogFile.log') })
    ]
});
logger.info('Starting service, Timestamp: '+Date.now());
// Requirements for job queue
const Queue = require('bull');
const redisHost = process.env.REDIS_HOST || config.REDIS_HOST;
const redisPort = process.env.REDIS_PORT || config.REDIS_PORT;
const queueName = config.QUEUE_NAME;
// The queue name is exactly the same as what we set in the server. Notice that you must connect to the same redis instance too.
const JobQueue = new Queue(queueName, { redis: { port: redisPort, host: redisHost } });

// Requirements for DB
const mongoose = require('mongoose');
const testdb = require('./models/loadTestDB');
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

// Requirements for SSH
const SSH = require('simple-ssh');
const fs = require('fs');

// helper functions
const hf = require('./helperFunctions');
const ssh = require('./loadServerSSH.js');

// Requirements for SCP
// const { Client } = require('node-scp');

// Consumer
JobQueue.process(async function (job, done) {
    let canGoAhead = false;
    job.progress(1);
    const testId = job.data.testId;
    logger.info(`processing job ${testId}`);
    const test = await testdb.findOne({ _id: testId });
    const updateResponse = await hf.updateStatus(test._id, null, "Running");
    logger.info("TestName: " + test.testName + "\n");

    // actual processing
    try {
        await hf.updateRun(test._id);
        await ssh.runPretrainedTestOnLoadServer(test)
            .then(() => { canGoAhead = true; job.progress(50); })
            .catch((err) => {
                logger.info("SSH_Error1: " + err);
                hf.updateError(test._id, err).then(() => {
                    done(err, {});
                });
            });
    }
    catch (err) {
        logger.info("SSH_Error2: " + err);
        await hf.updateStatus(test._id, null, "Error").then(() => hf.updateError(test._id, err));
        done(err, {});
    }

    // scp
    if (canGoAhead) {
        canGoAhead = false;
        try {
            logger.info("making result directory");
            const newFolder = path.join(__basedir, 'results', (test._id).toString());
            logger.info("folderpath: "+newFolder);
            await hf.mkdir(newFolder);
            job.progress(65);
            await hf.sleep(5000);
            logger.info("Downloading logs");
            await hf.scpDir(`/home/opc/loadTestUI/results/${test._id}`, newFolder).then(() => {
                canGoAhead = true;
                job.progress(90);
            });
            logger.info("Download complete");
        } catch (e) {
            logger.info("Error making directory and download: "+e);
            await hf.updateStatus(test._id, null, "Error").then(() => hf.updateError(test._id, e));
            done(e, {});
        }
    }

    // Get folder name
    // Results extraction to DB
    if (canGoAhead) {
        canGoAhead = false;
        try {
            logger.info("Updating results");
            let folder = await hf.getFolderName((test._id).toString());
            folder = folder.trim();
            hf.setFolder(test._id, folder);
            let results = hf.readStats((test._id).toString(), folder);
            await hf.updateStatus(test._id, results, "Completed").then(() => {
                canGoAhead = true;
                job.progress(100);
                done(null, { "result": "Test Job Executed successfully" });
            })
            logger.info("Update complete");
        } catch (e) {
            logger.info(e);
            await hf.updateStatus(test._id, null, "Error").then(() => hf.updateError(test._id, e));
            done(e, {});
        }
    }

    // mimic processing
    // hf.sleep(test.time*60*1000).then(()=>{
    //     hf.updateStatus(testId, null, "Completed");
    //     done(null, { t2: test.rps * 2, t3: test.rps * 3 });
    // })
});

// listener for job events
JobQueue.on('completed', function (job, result) {
    const testParams = job.data.newTest;
    logger.info(`job ${testParams._id} completed with result: ${JSON.stringify(result)}`)
})