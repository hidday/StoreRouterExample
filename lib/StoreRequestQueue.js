'use strict';

require('collections');
const bullQueue = require('bull');
const ioredis = require('ioredis');
const {printStoreRequest} = require('./StoreRequestHandler');
module.exports = class StoreRequestQueue {

    constructor(executionServiceName) {
        this.registeredStoreIds = new Set();

        // initiate a redis queue
        this.requestQueue = new bullQueue(executionServiceName, {
            redis: {
                port:  process.env.REDIS_PORT || 6379,
                host:  process.env.REDIS_HOST || '127.0.0.1'
            },
            createClient: () => {
                if (process.env.NODE_ENV !== 'production') {
                    const redisClient = new ioredis;
                    // console.log(`Connecting redis on localhost for development. execution service name: ${executionServiceName}`);
                    return redisClient;
                }
                else {
                    return new ioredis.Cluster([{
                        port: process.env.REDIS_PORT || 6379,
                        host: process.env.REDIS_HOST || '127.0.0.1'
                    }], {
                        scaleReads: 'master',
                        slotsRefreshTimeout: 10000
                    });
                }
            },
            // prefix: `{${executionServiceName}}`, // necessary on redis cluster mode
            removeOnSuccess: true, // Enable to have this worker automatically remove its successfully completed jobs from Redis, so as to keep memory usage down.
            removeOnFailure: true // This will not remove jobs that are set to retry unless they fail all their retries.

        });

        //todo check if process needs to be added only after connect event

        this.requestQueue.process(5, async (job) => {
            const storeRequest = job.data;
            printStoreRequest(storeRequest);
        });
    }

    getNumberOfRegisteredStores() {
        return this.registeredStoreIds.size;
    }

    registerStoreToQueue(storeId) {
        this.registeredStoreIds.add(storeId);
    }

    addRequestToJobQueue(storeId, request) {
        // job options
        const jobOpts = {
            attempts: 3,
            removeOnFail: true,     // Enable to have this worker automatically remove its successfully completed jobs from Redis, so as to keep memory usage down.
            removeOnComplete: true, // This will not remove jobs that are set to retry unless they fail all their retries.
            timeout: 10000
        };

        return this.requestQueue.add( { request: request, storeId: storeId }, jobOpts);
    }

    // valueOf() {
    //     return this.registeredStoreIds.size;
    // }

}



