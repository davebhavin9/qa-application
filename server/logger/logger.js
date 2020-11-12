//https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications


var appRoot = require('app-root-path');
var winston = require('winston');

var options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
        timestamp:true
    },
    console: {
        level: 'debug',
        filename: `${appRoot}/logs/error.log`,
        handleExceptions: true,
        json: false,
        colorize: true,
        timestamp:true
    },
};


var logger = new winston.createLogger({
    transports: [
        new winston.transports.File(options.file),
        new winston.transports.Console(options.console)
    ],
    exitOnError: false, 
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;