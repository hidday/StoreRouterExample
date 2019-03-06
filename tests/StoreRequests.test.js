// Please set mocha variable 'timeout' to be sufficient (like 50000...)
// Please set mocha variable 'exit'

process.env.NODE_ENV = 'development';

//During the test the env variable is set to test
require('collections');
const shuffle = require('shuffle-array');
const uuid = require('uuid');
const Mocha = require('mocha');
const {before, describe, after, it} = Mocha;

const querystring = require('querystring');
const cookie = require('cookie');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const server = require('../bin/storerouter');
const numberOfMockStores= 16;
const numberOfRequestsPerStoreRoute = 3;

describe('Send store api requests', (done) => {

    it('Send campaign request',async () => {
        let generatedStoreId = uuid.v4();
        return chai.request(server)
            .get(`/api/v1/campaigns/`)
            .query({storeId: generatedStoreId})
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.storeId).to.be.a('string', generatedStoreId);
                expect(res.body.executionService).to.be.a('string');
                console.log(`Routed store ${generatedStoreId} to execution service: ${res.body.executionService}`);
            });
    });

    it('Send giftcard request',async () => {
        let generatedStoreId = uuid.v4();
        return chai.request(server)
            .get(`/api/v1/storeId/${generatedStoreId}/giftCard/`)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.storeId).to.be.a('string', generatedStoreId);
                expect(res.body.executionService).to.be.a('string');
                console.log(`Routed store ${generatedStoreId} to execution service: ${res.body.executionService}`);
            });
    });

    it('Send setting request',async () => {
        let generatedStoreId = uuid.v4();
        return chai.request(server)
            .get(`/api/v1/settings/`)
            .set('storeId', generatedStoreId)
            .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body.storeId).to.be.a('string', generatedStoreId);
                expect(res.body.executionService).to.be.a('string');
                console.log(`Routed store ${generatedStoreId} to execution service: ${res.body.executionService}`);
            });
    });



    it('Send All Requests',async () => {
        // generate store id
        let storeIds = [];
        let servicesStoresCounter = {};
        let storesHandledRequestsCounter = {};
        for (let i = 0; i < numberOfMockStores; i++) {
            let generatedStoreId = uuid.v4();
            storeIds.push(generatedStoreId);
            storesHandledRequestsCounter[generatedStoreId] = 0; //init registered stores counter
        }

        // send one request for each store (to register services)
        for (let i = 0; i < storeIds.length; i++) {
            let res = await chai.request(server)
                .get(`/api/v1/storeId/${storeIds[i]}/giftCard`);

            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.storeId).to.be.a('string', storeIds[i]);
            expect(res.body.executionService).to.be.a('string');
            let {executionService, storeId} = res.body;
            executionService in servicesStoresCounter ? servicesStoresCounter[executionService]++ : servicesStoresCounter[executionService] = 0;
            storeId in storesHandledRequestsCounter ? storesHandledRequestsCounter[storeId]++ : storesHandledRequestsCounter[storeId] = 0; // init if store is unset
            console.log(`Routed store ${storeId} to execution service: ${executionService}`);
        }

        // init request bank to be sent
        let arrMockObjects = [];
        for (let i = 0; i < storeIds.length; i++) {
            for (let j = 0; j < numberOfRequestsPerStoreRoute; j++) {
                let giftMockObject = {
                    type: 'giftcard',
                    storeId: storeIds[i]
                };
                arrMockObjects.push({type: 'giftcard', storeId: storeIds[i]});
                arrMockObjects.push({type: 'campaigns', storeId: storeIds[i]});
                arrMockObjects.push({type: 'settings', storeId: storeIds[i]});
            }
        }

        // shuffle the mock array in order to create some randomness in the requests order
        shuffle(arrMockObjects);

        // make sure the other requests sent for the same execution service
        // check all routes for the same store
        // mix several stores - to test cross stores
        let responses = arrMockObjects.map(async (mockObject) => {

            let type = mockObject.type;

            switch (type) {
                case "giftcard":
                    return await chai.request(server)
                        .get(`/api/v1/storeId/${mockObject.storeId}/giftCard`)
                        .then((res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.storeId).to.be.a('string', mockObject.storeId);
                            expect(res.body.executionService).to.be.a('string');
                            let {executionService, storeId} = res.body;
                            storeId in storesHandledRequestsCounter ? storesHandledRequestsCounter[storeId]++ : storesHandledRequestsCounter[storeIds[storeId]] = 0; // init if store is unset
                            console.log(`Routed store ${storeId} to execution service: ${executionService}`);
                            return Promise.resolve(res);
                        });
                case "campaigns":
                    return await chai.request(server)
                        .get(`/api/v1/campaigns`)
                        .query({storeId: mockObject.storeId})
                        .then((res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.storeId).to.be.a('string', mockObject.storeId);
                            expect(res.body.executionService).to.be.a('string');
                            let {executionService, storeId} = res.body;
                            storeId in storesHandledRequestsCounter ? storesHandledRequestsCounter[storeId]++ : storesHandledRequestsCounter[storeIds[storeId]] = 0; // init if store is unset
                            console.log(`Routed store ${storeId} to execution service: ${executionService}`);
                            return Promise.resolve(res);
                        });
                case "settings":
                    return await chai.request(server)
                        .get(`/api/v1/settings`)
                        .set('storeId', mockObject.storeId)
                        .then((res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.be.an('object');
                            expect(res.body.storeId).to.be.a('string', mockObject.storeId);
                            expect(res.body.executionService).to.be.a('string');
                            let {executionService, storeId} = res.body;
                            storeId in storesHandledRequestsCounter ? storesHandledRequestsCounter[storeId]++ : storesHandledRequestsCounter[storeIds[storeId]] = 0; // init if store is unset
                            console.log(`Routed store ${storeId} to execution service: ${executionService}`);
                            return Promise.resolve(res);
                        });
                default:
                    break;
            }
        });

        let allResponses = await Promise.all(responses);

        console.log(`Execution Services store counters: `, JSON.stringify(servicesStoresCounter));
        console.log(`Stores Handled Requests Counters: `, JSON.stringify(storesHandledRequestsCounter));

        let arrServicesStoreCountersValues = Object.values(servicesStoresCounter);
        let maxStoresPerService = arrServicesStoreCountersValues.reduce(function(a, b) {
            return Math.max(a, b);
        });
        let minStoresPerService = arrServicesStoreCountersValues.reduce(function(a, b) {
            return Math.min(a, b);
        });

        let maxDifferenceInStoresDistribution = maxStoresPerService - minStoresPerService;

        // check for evenly distribution of stores
        expect(maxDifferenceInStoresDistribution).to.be.a('number');
        expect(maxDifferenceInStoresDistribution).to.be.below(2); // if evenly distributed, than the max difference should be 1

        // check for expected number of handled requests for each store
        for (let storeCounter in storesHandledRequestsCounter){
            if (storesHandledRequestsCounter.hasOwnProperty(storeCounter)) {
                expect(storesHandledRequestsCounter[storeCounter]).to.be.a('number');
                expect(storesHandledRequestsCounter[storeCounter]).to.equal(numberOfRequestsPerStoreRoute * 3 + 1 ); // multiply by number of routes + the 1 register request
            }
        }

        return Promise.resolve();
    });

});








