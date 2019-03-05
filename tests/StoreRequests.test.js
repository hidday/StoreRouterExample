process.env.NODE_ENV = 'development';

//During the test the env variable is set to test
require('collections');
const uuid = require('uuid');
const Mocha = require('mocha');
const {before, describe, after, it} = Mocha;

const querystring = require('querystring');
const cookie = require('cookie');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const server = 'localhost:3000/';
const numberOfMockStores= 5;

describe('Send store api requests', () => {

    it('Send campaign request',async () => {
        let generatedStoreId = uuid.v4();
        return await chai.request(server)
            .get(`api/v1/campaigns`)
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
        return await chai.request(server)
            .get(`api/v1/storeId/${generatedStoreId}/giftCard`)
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
        return await chai.request(server)
            .get(`api/v1/settings`)
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
        let servicesStoresCounter = [];
        let storesHandledRequestsCounter = [];
        for (let i = 0; i < numberOfMockStores; i++) {
            let generatedStoreId = uuid.v4();
            storeIds.push();
            servicesStoresCounter[generatedStoreId] = 0; //init registered stores counter
        }

        // send one request for each store (to register services)
        for (let i = 0; i < storeIds.length; i++) {
            let response = await chai.request(server)
                .get(`api/v1/storeId/${storeIds[i]}/giftCard`)
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    expect(res.body.storeId).to.be.a('string', generatedStoreId);
                    expect(res.body.executionService).to.be.a('string');
                    servicesStoresCounter[res.body.executionService] ? servicesStoresCounter[res.body.executionService]++ : servicesStoresCounter[res.body.executionService] = 0; // init if execution service is unset
                    storesHandledRequestsCounter[storeIds[i]] ? servicesStoresCounter[storeIds[i]]++ : servicesStoresCounter[storeIds[i]] = 0; // init if store is unset
                    console.log(`Routed store ${generatedStoreId} to execution service: ${res.body.executionService}`);
                });
        }

        // make sure the other requests sent for the same execution service
        // do same for all routes for the same store
        // mix several stores - to test cross stores

        // init request bank to be sent
        let requestList = [];
        const numberOfRequestsPerStoreRoute = 50;
        let mockObjects = [];
        for (let i = 0; i < storeIds.length; i++) {
            for (let j = 0; j < numberOfRequestsPerStoreRoute; j++) {
                let giftMockObject = {
                    type: 'giftcard',
                    storeId: storeIds[i],
                };

            }
        }
        
        let responses = mockObjects.map(async (trackQueryRecord) => {

            // parse track query record
            let rawQueryObject = JSON.parse(trackQueryRecord.query);

            let type = trackQueryRecord.track_type || rawQueryObject.track_type;

            switch (type) {
                case "click":
                    let queryString = querystring.stringify(rawQueryObject);
                    return await chai.request(server)
                        .get(`/track/click/?${queryString}`)
                        .set('Cookie', '_gid=trackTestingMarker')
                        .redirects(0)
                        .then((res) => {
                            expect(res).to.not.be.an('undefined');
                            if (res !== undefined) {
                                expect(res).to.have.status(302);
                            }
                            expect(res).to.have.cookie('ADS_TOKEN');
                            let tokenCookie = cookie.parse(res.headers['set-cookie'][0]);
                            if (tokenCookie.ADS_TOKEN !== undefined) {
                                replayedTracksTokens.push(tokenCookie.ADS_TOKEN);
                                return tokenCookie.ADS_TOKEN;
                            }
                            return false;
                        });
                case "event":
                    let eventName = rawQueryObject.eventName;
                    return await chai.request(server)
                        .get(`/track/event/${eventName}`)
                        .set('Cookie', '_gid=trackTestingMarker')
                        .then((res) => {
                            expect(res).to.not.be.an('undefined');
                            if (res !== undefined) {
                                expect(res).to.have.status(200);
                            }
                            expect(res.body).to.be.a('string');
                            replayedTracksTokens.push(res.body);
                            return res.body;
                        });
                case "action":
                    let actionId = rawQueryObject.actionId;
                    let actionName = rawQueryObject.actionName;
                    return await chai.request(server)
                        .get(`/track/action/${actionName}/${actionId}`)
                        .set('Cookie', '_gid=trackTestingMarker')
                        .then((res) => {
                            expect(res).to.not.be.an('undefined');
                            if (res !== undefined) {
                                expect(res).to.have.status(200);
                            }
                            expect(res.body).to.be.a('string');
                            replayedTracksTokens.push(res.body);
                            return res.body;
                        });
                default:
                    break;
            }
        });

        return Promise.all(responses);
    });

});








