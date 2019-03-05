'use strict';

const {routeRequest} = require('../lib/StoreRequestRouter');

module.exports = {
    handleCampaignsRequest: async (request, response) => {
        try {
            const storeId = request.query.storeId;
            if (!storeId) {
                return response.send('No store id!');
            }
            let result = await routeRequest(storeId, request);
            response.send(result.data);
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    },

    handleGiftCardRequest: async (request, response) => {
        try {
            const storeId = request.params.storeId;
            if (!storeId) {
                return response.send('No store id!');
            }
            let result = await routeRequest(storeId, request);
            let {queue, data} = result;
            response.send({storeId: data.storeId, executionService: queue.name});
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    },

    handleSettingRequest: async (request, response) => {
        try {
            const storeId = request.headers.storeid;
            if (!storeId) {
                return response.send('No store id!');
            }
            let result = await routeRequest(storeId, request);
            response.send(result.data);

            // console.log(`Store Id: ${storeId} . Request Data: ${request}`);
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    }
};
