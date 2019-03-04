'use strict';
const logger = require('../helpers/logger');
const requestLogger = logger.express().logger;
const Flatted = require('flatted/cjs');

module.exports = {
    printStoreRequest(storeRequest, executionServiceName) {
        let storeId = storeRequest.storeId;
        let request = storeRequest.request;
        requestLogger.info(`Executed by: ${executionServiceName}. Store Id: ${storeId}. request details: ${request}`);
    }
};