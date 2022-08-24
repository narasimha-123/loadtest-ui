const REDIS_HOST = 'redis';
const REDIS_PORT = 6379;
const QUEUE_NAME = 'loadtests';
const DB_URL = 'mongodb://mongo:27017/loadTestDB';
const SSH_HOST = '100.73.59.118';
const SSH_PORT = 22;
const SSH_USERNAME = 'opc';
const SSH_PRIVATEKEY = './id_rsa';
const API_PORT = 3001;

module.exports = {
    REDIS_HOST, 
    REDIS_PORT, 
    QUEUE_NAME, 
    DB_URL, SSH_HOST, 
    SSH_PORT, 
    SSH_USERNAME, 
    SSH_PRIVATEKEY,
    API_PORT,
}