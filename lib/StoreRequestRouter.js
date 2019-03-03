'use strict';

import {SortedSet, Map} from 'collections';
import * as PriorityQueue from 'priorityqueue';
import * as RequestQueue from 'StoreRequestQueue'

const NUM_OF_EXECUTION_SERVICES = 4; // todo- get value from config file

let executionServices = [];
let storeToServiceMap = new Map();

const getServiceWithLeastStores = () => {
    this.executionServices.sort((a, b) => a.getNumberOfRegisteredStores() - b.getNumberOfRegisteredStores());
    return this.executionServices[0];
};

// instantiate execution services
for (let i; i < NUM_OF_EXECUTION_SERVICES; i++) {
    let RequestQueue = new RequestQueue(`execution_service_${i}`);
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
        requestQueue.registerStoreToQueue(storeId);
        storeToServiceMap.set(storeId, requestQueue);
    }


    requestQueue.addRequestToJobQueue(storeId, request);
};

module.exports = {
    routeRequest
};

