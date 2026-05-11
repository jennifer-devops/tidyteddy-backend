const logger = require('pino');

const log = logger({
    base: {pid: false},
    transport: {
        target: 'pino-pretty',
        options: {
            colorized: true
        },
        timestamp: () => `,"time": "${new Date().toLocaleDateString()}"`
    }
});
module.exports = log;