'use strict';

const {routeRequest} = require('../lib/StoreRequestRouter');

module.exports = {
    handleCampaignsRequest: (request, response) => {
        try {
            const storeId = request.query.storeId;
            routeRequest(storeId, request);
            // console.log(`Store Id: ${storeId} . Request Data: ${request}`);
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    },

    handleGiftCardRequest: (request, response) => {
        try {
            const storeId = request.query.storeId;
            routeRequest(storeId, request);
            // console.log(`Store Id: ${storeId} . Request Data: ${request}`);
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    },

    handleSettingRequest: (request, response) => {
        try {
            const storeId = request.query.storeId;
            routeRequest(storeId, request);

            // console.log(`Store Id: ${storeId} . Request Data: ${request}`);
        } catch (e) {
            console.log('error occured: ', e);
            response.send(e);
        }
    }
};
