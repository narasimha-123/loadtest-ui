const Queue = require('bull');
const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = process.env.REDIS_PORT || 6379;
const queueName = 'loadtests'
const JobQueue = new Queue(queueName, { redis: { port: redisPort, host: redisHost } });
JobQueue.clean(0,'active');
// JobQueue.clean(100,'completed');
// JobQueue.clean(100,'wait');
// JobQueue.clean(100,'failed');
// JobQueue.obliterate({ force: true });
process.exit(1);