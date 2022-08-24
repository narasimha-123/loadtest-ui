const SSH = require('simple-ssh');
const fs = require('fs')
const config = require('./config');
const path = require('path');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__basedir, '/apiLogFile.log') })
    ]
});

let ssh = new SSH({
    host: config.SSH_HOST,
    port: config.SSH_PORT,
    user: config.SSH_USERNAME,
    key: fs.readFileSync(config.SSH_PRIVATEKEY,{encoding:'utf8'}),
});
const argList = process.argv.slice(2);
logger.info("folder: "+argList)

ssh.exec('rm', {
    args: ['-r',`loadTestUI/results/${argList[0]}` ],
    out: function(stdout) {
        logger.info("exec rm out: "+stdout);
    },
    err: function(stderr) {
        logger.info("exec rm err: "+stderr);
    },
    exit: function(code) {
        logger.info("exec rm exit code: "+code);
    }
}).start({
    success: function(code) {
        logger.info('ssh success: '+code);
    },
    fail: function(msg) {
        logger.info('ssh fail: '+msg);
    }
});