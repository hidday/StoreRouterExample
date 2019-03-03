'use strict';

import * as requestRouter from '../lib/StoreRequestRouter';

module.exports = {
    handleCampaignsRequest: (request, response) => {
        const storeId = request.query.storeId;
        requestRouter.routeRequest(storeId, request);
        // console.log(`Store Id: ${storeId} . Request Data: ${request}`);
    },

    handleGiftCardRequest: (request, response) => {
        const storeId = request.query.storeId;
        requestRouter.routeRequest(storeId, request);
        // console.log(`Store Id: ${storeId} . Request Data: ${request}`);
    },

    handleSettingRequest: (request, response) => {
        const storeId = request.query.storeId;
        requestRouter.routeRequest(storeId, request);

        // console.log(`Store Id: ${storeId} . Request Data: ${request}`);
    }
};
