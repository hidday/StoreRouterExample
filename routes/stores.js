const express = require('express');
const router = express.Router();

const storeController = require('../controllers/Store.js');


/* GET store requests */
router.get('/api/v1/campaigns', storeController.handleCampaignsRequest);
router.get('/api/v1/storeId/:storeId/giftCard', storeController.handleGiftCardRequest);
router.get('/api/v1/settings', storeController.handleSettingRequest);


module.exports = router;
