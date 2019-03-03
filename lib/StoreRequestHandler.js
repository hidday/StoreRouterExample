'use strict';

module.exports = {

    printStoreRequest(storeRequest) {
        let storeId = storeRequest.storeId;
        let request = storeRequest.request;
        console.log(`Store Id: ${storeId}. Request details: ${request}`);
    }

};