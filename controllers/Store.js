'use strict';

module.exports = {
    handleCampaignsRequest: (request, response) => {
        const storeId = request.query.storeId;
        console.log(`Store Id: ${storeId} . Request Data: ${request}`);
    },

    handleGiftCardRequest: (request, response) => {
        const storeId = request.query.storeId;
        console.log(`Store Id: ${storeId} . Request Data: ${request}`);
    },

    handleSettingRequest: (request, response) => {
        const storeId = request.query.storeId;
        console.log(`Store Id: ${storeId} . Request Data: ${request}`);
    }
};



// Queue thing

const helper = require('../helpers/global');
const logger = require('../helpers/logger');
const Queue = require('bull');
const ioRedis = require('ioredis');
const trackLib = require('../libs/track');
const impressionLib = require('../libs/impressions');

logger.info("Redis Host: ", process.env.REDIS_HOST);
logger.info("Redis port: ", process.env.REDIS_PORT);

const clusterOptions = {
    scaleReads: 'master',
    slotsRefreshTimeout: 10000
};

const env = process.env.NODE_ENV || 'development';

const trackQueuePublisher = new Queue('track', {
    redis: {
        port:  process.env.REDIS_PORT,
        host:  process.env.REDIS_HOST
    },
    createClient: () => {
        if (env === 'development') {
            const redisClient = new ioRedis;
            logger.debug('Connecting redis on localhost for development');
            return redisClient;
        }
        else {
            const cluster = new ioRedis.Cluster([{
                port:  process.env.REDIS_PORT,
                host:  process.env.REDIS_HOST
            }], clusterOptions);
            return cluster;
        }
    },
    prefix: '{tracks-queue}',
    removeOnSuccess: true, // Enable to have this worker automatically remove its successfully completed jobs from Redis, so as to keep memory usage down.
    removeOnFailure: true // This will not remove jobs that are set to retry unless they fail all their retries.

});

const impressionQueuePublisher = new Queue('impression', {
    redis: {
        port:  process.env.REDIS_PORT,
        host:  process.env.REDIS_HOST
    },
    createClient: () => {
        if (env === 'development') {
            const redisClient = new ioRedis;
            logger.debug('Connecting redis on localhost for development');
            return redisClient;
        }
        else {
            const cluster = new ioRedis.Cluster([{
                port:  process.env.REDIS_PORT,
                host:  process.env.REDIS_HOST
            }], clusterOptions);
            return cluster;
        }
    },
    prefix: '{impressions-queue}',
    removeOnSuccess: true, // Enable to have this worker automatically remove its successfully completed jobs from Redis, so as to keep memory usage down.
    removeOnFailure: true // This will not remove jobs that are set to retry unless they fail all their retries.

});

// job options
const jobOpts = {
    attempts: 3,
    removeOnFail: true,     // Enable to have this worker automatically remove its successfully completed jobs from Redis, so as to keep memory usage down.
    removeOnComplete: true, // This will not remove jobs that are set to retry unless they fail all their retries.
    timeout: 10000
};

module.exports = {

    addTrackJob: async (trackRecord) => {
        try {
            const trackJob = trackQueuePublisher.add(trackRecord, jobOpts);
            const trackRecordString = JSON.stringify(trackRecord);
            logger.info(`Added track record to Redis track Queue. track record details: ${trackRecordString}`);
            return trackRecordString;
        } catch (e) {
            const trackRecordString = JSON.stringify(trackRecord);
            logger.error(`Error: failed to add track job to queue. track record details:  ${trackRecordString}. `, e);
        }
    },

    addClickTrackJob: async (trackRecord) => {
        try {
            const trackJob = trackQueuePublisher.add('click', trackRecord, jobOpts);
            const trackRecordString = JSON.stringify(trackRecord);
            logger.info(`Added track record to Redis track Queue. track record details: ${trackRecordString}`);
            return trackRecordString;
        } catch (e) {
            const trackRecordString = JSON.stringify(trackRecord);
            logger.error(`Error: failed to add track job to queue. track record details:  ${trackRecordString}. `, e);
        }
    },

    addActionTrackJob: async (trackRecord) => {
        try {
            const trackJob = trackQueuePublisher.add('action', trackRecord, jobOpts);
            const trackRecordString = JSON.stringify(trackRecord);
            logger.info(`Added track record to Redis track Queue. track record details: ${trackRecordString}`);
            return trackRecordString;
        } catch (e) {
            const trackRecordString = JSON.stringify(trackRecord);
            logger.error(`Error: failed to add track job to queue. track record details:  ${trackRecordString}. `, e);
        }
    },

    addEventTrackJob: async (trackRecord) => {
        try {
            const trackJob = trackQueuePublisher.add('event', trackRecord, jobOpts);
            const trackRecordString = JSON.stringify(trackRecord);
            logger.info(`Added track record to Redis track Queue. track record details: ${trackRecordString}`);
            return trackRecordString;
        } catch (e) {
            const trackRecordString = JSON.stringify(trackRecord);
            logger.error(`Error: failed to add track job to queue. track record details:  ${trackRecordString}. `, e);
        }
    },

    addImpressionJob: async (impressionRecord) => {
        try {
            const impressionJob = impressionQueuePublisher.add(impressionRecord, jobOpts);
            const impressionRecordString = JSON.stringify(impressionRecord);
            logger.info(`Added impression record to Redis impression Queue. impression record details: ${impressionRecordString}`);
            return impressionRecordString;
        } catch (e) {
            const impressionRecordString = JSON.stringify(impressionRecord);
            logger.error(`Error: failed to add impression job to queue. impression record details:  ${impressionRecordString}. `, e);
        }
    }
};








// Process thing:

#!/usr/bin/env node
require('dotenv').config();
const logger = require('../helpers/logger');
const Queue = require('bull');
const ioRedis = require('ioredis');
const trackLib = require('../libs/track');
const impressionLib = require('../libs/impressions');

const env = process.env.NODE_ENV || 'development';

const clusterOptions = {
    scaleReads: 'slave',
    slotsRefreshTimeout: 10000
};

const trackQueueSubscriber = new Queue('track', {
    redis: {
        port:  process.env.REDIS_PORT,
        host:  process.env.REDIS_HOST
    },
    createClient: () => {
        if (env === 'development') {
            const redisClient = new ioRedis;
            logger.debug('Connecting redis on localhost for development');
            return redisClient;
        }
        else {
            const cluster = new ioRedis.Cluster([{
                port:  process.env.REDIS_PORT,
                host:  process.env.REDIS_HOST
            }], clusterOptions);
            return cluster;
        }

    },
    prefix: '{tracks-queue}',
    removeOnSuccess: true, // Enable to have this worker automatically remove its successfully completed jobs from Redis, so as to keep memory usage down.
    removeOnFailure: true // This will not remove jobs that are set to retry unless they fail all their retries.
});

const impressionQueueSubscriber = new Queue('impression', {
    redis: {
        port:  process.env.REDIS_PORT,
        host:  process.env.REDIS_HOST
    },
    createClient: () => {
        if (env === 'development') {
            const redisClient = new ioRedis;
            logger.debug('Connecting redis on localhost for development');
            return redisClient;
        }
        else {
            const cluster = new ioRedis.Cluster([{
                port:  process.env.REDIS_PORT,
                host:  process.env.REDIS_HOST
            }], clusterOptions);
            return cluster;
        }

    },
    prefix: '{impressions-queue}',
    removeOnSuccess: true, // Enable to have this worker automatically remove its successfully completed jobs from Redis, so as to keep memory usage down.
    removeOnFailure: true // This will not remove jobs that are set to retry unless they fail all their retries.
});

logger.info('Initiating Processors (!)');
trackQueueSubscriber.process(5, async (job) => {
    logger.info(`Processing job ${job.id}`);
    const trackRecord = job.data;
    return trackLib.flushRedis(trackRecord);
});

// trackQueue.process('click', async (job) => {
//     logger.info(`Processing job ${job.id}`);
//     const trackRecord = job.data;
//     return trackLib.flushRedis(trackRecord);
// });
//
// trackQueue.process('action', async (job) => {
//     logger.info(`Processing job ${job.id}`);
//     const trackRecord = job.data;
//     return trackLib.flushRedis(trackRecord);
// });
//
// trackQueue.process('event', async (job) => {
//     logger.info(`Processing job ${job.id}`);
//     const trackRecord = job.data;
//     return trackLib.flushRedis(trackRecord);
// });

impressionQueueSubscriber.process(5, async (job) => {
    logger.info(`Processing job ${job.id}`);
    const impressionRecord = job.data;
    return impressionLib.saveImpression(impressionRecord);
});