var express = require('express');
var router = express.Router();

import * as storeController from 'controllers/Store';


/* GET store requests */
router.get('/api/v1/campaigns', storeController.handleCampaignsRequest);
router.get('/api/v1/storeId/:storeId/giftCard', storeController.handleGiftCardRequest);
router.get('/api/v1/settings', storeController.handleSettingRequest);


module.exports = router;
