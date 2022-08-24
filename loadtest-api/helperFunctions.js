const { Client } = require('node-scp');
const fs = require('fs');
const config = require('./config');
const path = require('path');
const winston = require('winston');
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(__basedir, '/apiLogFile.log') })
    ]
});

async function scpDir(from, to) {
    try {
        const client = await Client({
            host: config.SSH_HOST,
            port: config.SSH_PORT,
            user: config.SSH_USERNAME,
            key: fs.readFileSync(config.SSH_PRIVATEKEY, { encoding: 'utf8' }),
            // passphrase: 'your key passphrase',
        })
        await client.uploadDir(from, to);
        client.close() // remember to close connection after you finish
        return;
    } catch (e) {
        logger.info("SCP " + e);
    }
}

async function updateError(id, err) {
    return testdb.updateOne({ _id: id }, { error: err }).then((result) => {
        logger.info("Error Update Response:");
        logger.info(result);
    });
}

module.exports = { scpDir, updateError }