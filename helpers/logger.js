const logger = require('pino')();
const expressLogger = require('express-pino-logger')();

module.exports = {
    query: (...args) => {
        logger.debug('query', args.join(' '));
    },
    info: (...args) => {
        logger.info(args.join(' '));
    },
    warning: (...args) => {
        logger.warn(args.join(' '));
    },

    debug: (...args) => {
        logger.debug(args.join(' '));
    },

    error: (...args) => {
        logger.error(args.join(' '));
    },
    express: () => expressLogger,
};