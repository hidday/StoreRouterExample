//During the test the env variable is set to test
const uuid = require('uuid');

process.env.NODE_ENV = 'development';
const Mocha = require('mocha');
const {before, describe, after, it} = Mocha;

const querystring = require('querystring');
const cookie = require('cookie');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const server = 'localhost:3000/';
const numberOfRequestsPerStoreRoute = 50;
const numberOfMockStores= 5;
let mockRequestsUrls = [];
for (let i = 0; i < numberOfMockStores; i++) {
    let generatedStoreId = uuid.v4();
    for (let j = 0; j < numberOfRequestsPerStoreRoute; j++) {
        mockRequestsUrls.push(`api/v1/storeId/${generatedStoreId}/giftCard`);
        mockRequestsUrls.push(`/api/v1/campaigns/?${generatedStoreId}`);
        mockRequestsUrls.push(`api/v1/settings`);
    }
}
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
        // todo -
        // generate store id
        // send one request
        // store the execution service name
        // make sure the other requests sent for the same execution service
        // do same for all routes for the same store
        // mix several stores - to test cross stores
        
        let responses = mockRequestsUrls.map(async (trackQueryRecord) => {

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








