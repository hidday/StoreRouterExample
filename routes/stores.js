var express = require('express');
var router = express.Router();

const brandController = require('../../server/controllers/brand');
import myFunc from './myfile';


/* GET store requests */
router.get('/api/v1/campaigns', brandController.index);
router.get('/api/v1/storeId/:storeId/giftCard', brandController.index);
router.get('/api/v1/settings', brandController.index);


module.exports = router;
