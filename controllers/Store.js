'use strict';

const {routeRequest} = require('../lib/StoreRequestRouter');

module.exports = {
    handleCampaignsRequest: async (request, response) => {
        try {
            const storeId = request.query.storeId;
            let result = await routeRequest(storeId, request);
            response.send(result);
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    },

    handleGiftCardRequest: async (request, response) => {
        try {
            const storeId = request.query.storeId;
            let result = await routeRequest(storeId, request);
            response.send(result);
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    },

    handleSettingRequest: async (request, response) => {
        try {
            const storeId = request.query.storeId;
            let result = await routeRequest(storeId, request);
            response.send(result);

            // console.log(`Store Id: ${storeId} . Request Data: ${request}`);
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    }
};
