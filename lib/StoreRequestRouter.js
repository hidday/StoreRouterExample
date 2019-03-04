'use strict';

require('collections');
const StoreRequestQueue = require('./StoreRequestQueue');
const Flatted = require('flatted/cjs');

const NUM_OF_EXECUTION_SERVICES = 4; // todo- get value from config file

let executionServices = [];
let storeToServiceMap = new Map();

const getServiceWithLeastStores = () => {
    executionServices.sort((a, b) => a.getNumberOfRegisteredStores() - b.getNumberOfRegisteredStores());
    return executionServices[0];
};

// instantiate execution services
for (let i = 0; i < NUM_OF_EXECUTION_SERVICES; i++) {
    let RequestQueue = new StoreRequestQueue(`execution_service_${i}`);
    executionServices.push(RequestQueue);
}

const routeRequest = (storeId, request) => {
    let requestQueue = null;
    // check if the store is already registered
    if (storeToServiceMap.has(storeId)) {
        requestQueue = storeToServiceMap.get(storeId);
    }
    else {
        // register new store
        requestQueue = getServiceWithLeastStores();
        if (!requestQueue) {
            throw new Error(`couldn't find an execution service`);
        }
        requestQueue.registerStoreToQueue(storeId);
        storeToServiceMap.set(storeId, requestQueue);
    }


    return requestQueue.addRequestToJobQueue(storeId, Flatted.stringify(request));
};

module.exports = {
    routeRequest
};

