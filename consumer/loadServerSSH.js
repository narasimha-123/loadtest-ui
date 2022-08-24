const config = require('./config.js');
const SSH = require('simple-ssh');
const fs = require('fs');
const path = require('path');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__basedir, '/consumerLogFile.log') })
    ]
});

function runPretrainedTestOnLoadServer(test) {
    let ssh = new SSH({
        host: config.SSH_HOST,
        port: config.SSH_PORT,
        user: config.SSH_USERNAME,
        key: fs.readFileSync(config.SSH_PRIVATEKEY, { encoding: 'utf8' }),
    });
    logger.info("Starting SSH commands");

    return new Promise((resolve, reject) => {
        try {
            ssh.exec('mkdir', {
                args: [`loadTestUI/results/${test._id}`],
                out: function (stdout) {
                    logger.info("Exec mkdir Command Output: " + stdout);
                },
                err: function (stderr) {
                    reject(new Error("Error while running mkdir on server :".concat(' ', stderr)));
                },
                exit: function (code) {
                    logger.info("Exec mkdir Command Exit Code: " + code);
                }
            }).exec('sh', {
                args: ['loadTestUI/runner.sh', test.rps, test.users, test.time, test.env, test.input, `loadTestUI/results/${test._id}`],
                out: function (stdout) {
                    logger.info("Exec sh Command Output: " + stdout);
                },
                err: function (stderr) {
                    reject(new Error("Error while running test on server :".concat(' ', stderr)));
                },
                exit: function (code) {
                    logger.info("Exec sh Command Exit Code: " + code);
                    logger.info("Getting foldername");
                    resolve("Test executed on Server");
                }
            }).exec(`tail -1 /home/opc/loadTestUI/results/${test._id}/loadtests.log | rev | cut -d'/' -f 2 | rev`, {
                out: function (stdout) {
                    logger.info("Exec tail Command Output:" + stdout + "test._id: " + test._id);
                },
                err: function (stderr) {
                    logger.info("Error while running tail on server :".concat(' ', stderr));
                },
                exit: function (code) {
                    logger.info("Exec tail Command Exit Code: " + code);
                }
            }).start({
                success: function () {
                    logger.info('SSH Successful');
                },
                // fail: function (errMsg) {
                //     logger.info('SSH Failed '.concat(errMsg));
                //     throw new Error("SSH Failed ".concat(errMsg));
                // }
            });

            ssh.on('error', function (err) {
                logger.info('Oops, something went wrong.\n' + err);
                ssh.end();
                reject(new Error(err));
            });

            ssh.on('close', () => {
                logger.info('SSH closed');
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
module.exports = { runPretrainedTestOnLoadServer };