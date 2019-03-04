process.env.NODE_ENV = 'development';

//During the test the env variable is set to test
const Mocha = require('mocha');
const {before, describe, after, it} = Mocha;

const querystring = require('querystring');
const cookie = require('cookie');
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

const server = 'localhost:3000';
const numberOfTracks = 50;
let replayedTracksTokens = [];
let trackQueryRecords = null;
describe('Replay Tracks', () => {

    before(async () => {
        // read track queries from out_db
        return await chai.request(server)
            .get(`/test/getTrackQueries/`)
            .set('token', jwtToken)
            .send({ numOfTracks: numberOfTracks })
            .then((res) => {
                trackQueryRecords = res.body.data;
                return Promise.all([expect(res).to.not.be.an('undefined'),
                expect(res.body.data).to.be.an('array')]);
            });
    });

    it('Send All Tracks',async () => {
        let responses = trackQueryRecords.map(async (trackQueryRecord) => {

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

    it('Pop tracks from Redis to DB',async () => {
        console.log('inserted tracks tokens', JSON.stringify(replayedTracksTokens));
        console.log('Total number of replayed tracks', replayedTracksTokens.length || 0);
        return await chai.request(server)
            .post('/test/processRedis/')
            .send({numOfRecordsToPop: replayedTracksTokens.length + 100}) // +100 to ensure that if other records were written during the run, the tested tracks wouldn't be left out.
            .set('token', jwtToken)
            .then((res) => {
                expect(res.body.data).to.be.an('object');
                expect(res.body.data.numOfPoppedRecords).to.be.a('number');
                let numOfPoppedRecords = res.body.data.numOfPoppedRecords;
                console.log('Total number of records written to DB: ', numOfPoppedRecords || 0);
            });
    });

    after(async () => {
        return await chai.request(server)
            .post('/test/deleteTracksByTokenIds/')
            .send({arrTokensToDelete: replayedTracksTokens})
            .set('token', jwtToken)
            .then((res) => {
                let numOfDeletedRecords = res.body.data.numOfDeletedTracks;
                let numOfDeletedTrackQueries = res.body.data.numOfDeletedTrackQueries;
                console.log('Total number of deleted tracks (by their token): ', numOfDeletedRecords || 0);
                console.log('Total number of deleted track queries (by their foreign key to tracks): ', numOfDeletedTrackQueries || 0);
            });
    });
});








