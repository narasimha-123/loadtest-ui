const config = require('./config.js');
global.__basedir = __dirname;
const path = require('path');

const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__basedir, '/consumerLogFile.log') })
    ]
});

const mongoose = require('mongoose');
const testdb = require('./models/loadTestDB');
const dbURL = config.DB_URL;
mongoose.connect(dbURL).catch((err) => {
    logger.info("Error establishing connection to DB");
    logger.info(err);
})
const dbConnection = mongoose.connection
dbConnection.on('open', () => {
    logger.info('DB connected helper')
}).on('error', err => {
    logger.info("DB Error helper");
    logger.info(err);
});

async function setFolder(id, folderName) {
    logger.info("Updating folderName of " + id + " to " + folderName)
    return testdb.updateOne({ _id: id }, { test_folder: folderName }).then((result) => {
        logger.info("FolderName Update Response:");
        logger.info(result);
    });
}

async function updateError(id, err) {
    return testdb.updateOne({ _id: id }, { error: err, status:"Error" }).then((result) => {
        logger.info("Error Update Response:");
        logger.info(result);
    });
}

async function updateRun(id) {
        const now = Date.now();
        logger.info("Running " + id +" at "+now);
        return testdb.updateOne({ _id: id }, { runAt: now }).then((result) => {
            logger.info("runAt Update Response:");
            logger.info(result);
        });
}

async function updateStatus(id, results, status) {
    if (results) {
        logger.info("Updating status of " + id + " to " + status);
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const { Client } = require('node-scp');
const fs = require('fs');
async function scpFile(from, to) {
    try {
        const client = await Client({
            host: config.SSH_HOST,
            port: config.SSH_PORT,
            username: config.SSH_USERNAME,
            privateKey: fs.readFileSync(config.SSH_PRIVATEKEY, { encoding: 'utf8' }),
            // passphrase: 'your key passphrase',
        })
        await client.downloadFile(from, to);
        client.close(); // remember to close connection after you finish
        return;
    } catch (e) {
        logger.info("SCP " + e);
    }
}

async function scpDir(from, to) {
    try {
        const client = await Client({
            host: config.SSH_HOST,
            port: config.SSH_PORT,
            username: config.SSH_USERNAME,
            privateKey: fs.readFileSync(config.SSH_PRIVATEKEY, { encoding: 'utf8' }),
            // passphrase: 'your key passphrase',
        })
        await client.downloadDir(from, to);
        client.close() // remember to close connection after you finish
        return;
    } catch (e) {
        logger.info("SCP " + e);
    }
}

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function mkdir(dir) {
    try {
        return  exec(`mkdir ${dir}`).then(({stdout, stderr})=>{
            logger.info('stdout:', stdout);
            console.error('stderr:', stderr);
        });
    }catch(err){
        logger.info("mkdir " + e);
    }
}
async function getFolderName(id) {
    try {
        const logFilePath = path.join(__basedir, 'results', id, 'loadtests.log');
        const { stdout, stderr } = await exec(`tail -1 ${logFilePath} | rev | cut -d'/' -f 2 | rev`);
        logger.info('folderName:', stdout);
        console.error('stderr:', stderr);
        return stdout.toString().trim();
    }catch(err){
        logger.info("tail " + e);
    }
}
function readStats(id, folder) {
    
    let logfile =  path.join(__basedir, 'results', id, 'loadtests.log');
    let filepath = path.join(__basedir, 'results', id, folder, 'js', 'global_stats.json');
    // logger.info(filepath);
    // filepath = `./results/basicsimulation-20220520121529292/js/global_stats.json`;
    try {
        if (fs.existsSync(logfile)) {
            //logfile exists
            if (fs.existsSync(filepath)){
                //json exits
            }
        }
    } catch (err) {
        console.error(err);
        let res = {
            numberOfRequests: {
                total: '',
                ok: '',
                ko: ''
            },
            minResponseTime: {
                total: '',
                ok: '',
                ko: ''
            },
            maxResponseTime: {
                total: '',
                ok: '',
                ko: ''
            },
            meanResponseTime: {
                total: '',
                ok: '',
                ko: ''
            },
            standardDeviation: {
                total: '',
                ok: '',
                ko: ''
            },
            meanNumberOfRequestsPerSecond: {
                total: '',
                ok: '',
                ko: ''
            },

            p50: {
                total: '',
                ok: '',
                ko: ''
            },
            p75: {
                total: '',
                ok: '',
                ko: ''
            },
            p95: {
                total: '',
                ok: '',
                ko: ''
            },
            p99: {
                total: '',
                ok: '',
                ko: ''
            },

            group1: {
                name:  "t < 200 ms",
                count: '',
                percentage: ''
            },
            group2: {
                name: "200 ms < t < 1000 ms",
                count: '',
                percentage: ''
            },
            group3: {
                name: "t > 1000 ms",
                count: '',
                percentage: ''
            },
            group4: {
                name: "failed",
                count: '',
                percentage: ''
            }
        }
        return null;
    }
    const stats = require(filepath);

    let res = {
        numberOfRequests: {
            total: stats['numberOfRequests']['total'],
            ok: stats['numberOfRequests']['ok'],
            ko: stats['numberOfRequests']['ko']
        },
        minResponseTime: {
            total: stats['minResponseTime']['total'],
            ok: stats['minResponseTime']['ok'],
            ko: stats['minResponseTime']['ko']
        },
        maxResponseTime: {
            total: stats['maxResponseTime']['total'],
            ok: stats['maxResponseTime']['ok'],
            ko: stats['maxResponseTime']['ko']
        },
        meanResponseTime: {
            total: stats['meanResponseTime']['total'],
            ok: stats['meanResponseTime']['ok'],
            ko: stats['meanResponseTime']['ko']
        },
        standardDeviation: {
            total: stats['standardDeviation']['total'],
            ok: stats['standardDeviation']['ok'],
            ko: stats['standardDeviation']['ko']
        },
        meanNumberOfRequestsPerSecond: {
            total: stats['meanNumberOfRequestsPerSecond']['total'],
            ok: stats['meanNumberOfRequestsPerSecond']['ok'],
            ko: stats['meanNumberOfRequestsPerSecond']['ko']
        },
        p50: {
            total: stats['percentiles1']['total'],
            ok: stats['percentiles1']['ok'],
            ko: stats['percentiles1']['ko']
        },
        p75: {
            total: stats['percentiles2']['total'],
            ok: stats['percentiles2']['ok'],
            ko: stats['percentiles2']['ko']
        },
        p95: {
            total: stats['percentiles3']['total'],
            ok: stats['percentiles3']['ok'],
            ko: stats['percentiles3']['ko']
        },
        p99: {
            total: stats['percentiles4']['total'],
            ok: stats['percentiles4']['ok'],
            ko: stats['percentiles4']['ko']
        },
        group1: {
            name:  "t < 200 ms",
            count: stats['group1']['count'],
            percentage: stats['group1']['percentage']
        },
        group2: {
            name: "200 ms < t < 1000 ms",
            count: stats['group2']['count'],
            percentage: stats['group2']['percentage']
        },
        group3: {
            name: "t > 1000 ms",
            count: stats['group3']['count'],
            percentage: stats['group3']['percentage']
        },
        group4: {
            name: "failed",
            count: stats['group4']['count'],
            percentage: stats['group4']['percentage']
        }
    }
    return res;
}

module.exports = { updateError, updateRun, setFolder, updateStatus, sleep, scpFile, scpDir, mkdir, readStats, getFolderName }