'use strict';

import {SortedSet, Map} from 'collections';
import * as PriorityQueue from 'priorityqueue';
import * as RequestQueue from 'StoreRequestQueue'

const NUM_OF_EXECUTION_SERVICES = 4;

const executionServices = new SortedSet({
    comparator: (a,b) => {
        return a.getNumberOfRegisteredStores() - b.getNumberOfRegisteredStores();
    }
});

// instantiate execution services
for (let i; i < NUM_OF_EXECUTION_SERVICES; i++) {

    let RequestQueue = new RequestQueue(`execution_service_${i}`);

    executionServices
}

const storeMap = new Map();

