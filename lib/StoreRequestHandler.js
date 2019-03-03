'use strict';
const logger = require('../helpers/logger');
const requestLogger = logger.express().logger;

module.exports = {

    printStoreRequest(storeRequest) {
        let storeId = storeRequest.storeId;
        let request = storeRequest.request;
        console.log(`Store Id: ${storeId}`);
        requestLogger.info(request);
    }

};