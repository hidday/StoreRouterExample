/* global describe */
/* eslint-disable prefer-arrow-callback, func-names */
process.env.NODE_ENV = 'development';
const chai = require('chai');
const chaiHttp = require('chai-http');
const model = require('../models/index');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Advertiser', () => {
    describe('/POST create advertiser', () => {
        before((done) => {
            model.advertisers
                .destroy({
                    where:
                        {
                            name: 'An Advertiser Title',
                        },
                }).then(() => done());
        });

        const data = {
            name: 'An Advertiser Title',
            status: 'active',
            url: 'http://storerouter.test.com',
        };

        it('it should create advertiser with provided mongodb_id', (done) => {
            data.advertiser_mongo_id = '542d735d3ef5cef67e591955';
            chai.request('http://127.0.0.1:3001')
                .post('/advertiser')
                .send(data)
                .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNhZ2lAdHJhZmZpY3BvaW50LmlvIiwidXNlcm5hbWUiOiJzYWdpIiwic3ViIjpudWxsLCJleHAiOjE1MjY0OTcxNjcsImlzcyI6Imh0dHA6Ly9jbXMubG9jL2JvL2FkdmVydGlzZXJzIiwiaWF0IjoxNTI2NDgyNzY3LCJuYmYiOjE1MjY0ODI3NjcsImp0aSI6IlJrd1JVQjg3MWx6V3Y5c0IifQ.5K22U1BfJ0rpBBC2HQ7Nf5sdZz6Kl5FVG784M35LUeQ')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log('res:',res)
                    expect(res).to.not.be.an('undefined');
                    if (res !== undefined) {
                        expect(res).to.have.status(200);
                    }
                    return model.advertisers
                        .findOne({ where: data })
                        .then((result) => {
                            expect(result).to.not.be.an('undefined');
                            done();
                        })
                        .catch((err) => {
                            expect(err).to.not.be.an('undefined');
                            done();
                        });
                });
        });
    });
    describe('/POST create brand', () => {

        let advertiser_int_id = null;
        before((done) => {
            model.brands
                .destroy({
                    where:
                        {
                            name: 'A Brand Title',
                        },
                }).then(() => {
                model.advertisers
                    .findOne({
                        where:
                            {
                                advertiser_mongo_id: '540c6c18be49c15c211f2a63',
                            },
                    }).then((result) => {

                        // advertiser_int_id = result.id;
                        advertiser_int_id = 364;
                        done()
                    });
                });

        });



        const data = {
            name: 'A Brand Title',
            status: 'active',
            id: 'hidday.and.david',
            advertiser_id: advertiser_int_id
        };

        it('it should create brand with provided mongodb_id', (done) => {

            chai.request('http://127.0.0.1:3001')
                .post(`/advertiser/${advertiser_int_id}/brands`)
                .send(data)
                .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNhZ2lAdHJhZmZpY3BvaW50LmlvIiwidXNlcm5hbWUiOiJzYWdpIiwic3ViIjpudWxsLCJleHAiOjE1MjY0OTcxNjcsImlzcyI6Imh0dHA6Ly9jbXMubG9jL2JvL2FkdmVydGlzZXJzIiwiaWF0IjoxNTI2NDgyNzY3LCJuYmYiOjE1MjY0ODI3NjcsImp0aSI6IlJrd1JVQjg3MWx6V3Y5c0IifQ.5K22U1BfJ0rpBBC2HQ7Nf5sdZz6Kl5FVG784M35LUeQ')
                .end((err, res) => {
                    console.log('res:',res.text);
                    expect(res).to.not.be.an('undefined');
                    if (res !== undefined) {
                        expect(res).to.have.status(200);
                    }
                    return model.brands
                        .findOne({ where: data })
                        .then((result) => {
                            expect(result).to.not.be.an('undefined');
                            done();
                        })
                        .catch((err) => {
                            expect(err).to.not.be.an('undefined');
                            done();
                        });
                });
        });
    });
    describe('/POST create campaign', () => {

        let advertiser_int_id = 403;
        // before((done) => {
        //     model.brands
        //         .destroy({
        //             where:
        //                 {
        //                     name: 'A Brand Title',
        //                 },
        //         }).then(() => {
        //         model.advertisers
        //             .findOne({
        //                 where:
        //                     {
        //                         advertiser_mongo_id: '540c6c18be49c15c211f2a63',
        //                     },
        //             }).then((result) => {
        //
        //             // advertiser_int_id = result.id;
        //             advertiser_int_id = 364;
        //             done()
        //         });
        //     });
        //
        // });



        const data = {
            name: 'A Brand Title',
            status: 'active',
            campaign_mongo_id: 'hidday.and.david',
            advertiser_id: advertiser_int_id
        };

        it('it should create campaign with provided mongodb_id', (done) => {

            chai.request('http://127.0.0.1:3001')
                .post(`/advertiser/${advertiser_int_id}/brands/543393e25eb4a1bc3f1058b7/campaigns`)
                .send(data)
                .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNhZ2lAdHJhZmZpY3BvaW50LmlvIiwidXNlcm5hbWUiOiJzYWdpIiwic3ViIjpudWxsLCJleHAiOjE1MjY0OTcxNjcsImlzcyI6Imh0dHA6Ly9jbXMubG9jL2JvL2FkdmVydGlzZXJzIiwiaWF0IjoxNTI2NDgyNzY3LCJuYmYiOjE1MjY0ODI3NjcsImp0aSI6IlJrd1JVQjg3MWx6V3Y5c0IifQ.5K22U1BfJ0rpBBC2HQ7Nf5sdZz6Kl5FVG784M35LUeQ')
                .end((err, res) => {
                    console.log('res:',res.text);
                    expect(res).to.not.be.an('undefined');
                    if (res !== undefined) {
                        expect(res).to.have.status(200);
                    }
                    return model.brands
                        .findOne({ where: data })
                        .then((result) => {
                            expect(result).to.not.be.an('undefined');
                            done();
                        })
                        .catch((err) => {
                            expect(err).to.not.be.an('undefined');
                            done();
                        });
                });
        });
    });
    describe('/POST create campaign', () => {

        let advertiser_int_id = 403;
        // before((done) => {
        //     model.brands
        //         .destroy({
        //             where:
        //                 {
        //                     name: 'A Brand Title',
        //                 },
        //         }).then(() => {
        //         model.advertisers
        //             .findOne({
        //                 where:
        //                     {
        //                         advertiser_mongo_id: '540c6c18be49c15c211f2a63',
        //                     },
        //             }).then((result) => {
        //
        //             // advertiser_int_id = result.id;
        //             advertiser_int_id = 364;
        //             done()
        //         });
        //     });
        //
        // });



        const data = {
            name: 'A Brand Title',
            status: 'active',
            mongodb_id: 'hidday.and.david',
            is_default: 0,
            use_token: 0,
            token: '12345',
            weight: 100,
            url: "yo.com"
        };

        it('it should create landing page with provided mongodb_id', (done) => {

            chai.request('http://127.0.0.1:3001')
                .post(`/advertiser/${advertiser_int_id}/brands/543393e25eb4a1bc3f1058b7/campaigns/48491/lp`)
                .send(data)
                .set('token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InNhZ2lAdHJhZmZpY3BvaW50LmlvIiwidXNlcm5hbWUiOiJzYWdpIiwic3ViIjpudWxsLCJleHAiOjE1MjY0OTcxNjcsImlzcyI6Imh0dHA6Ly9jbXMubG9jL2JvL2FkdmVydGlzZXJzIiwiaWF0IjoxNTI2NDgyNzY3LCJuYmYiOjE1MjY0ODI3NjcsImp0aSI6IlJrd1JVQjg3MWx6V3Y5c0IifQ.5K22U1BfJ0rpBBC2HQ7Nf5sdZz6Kl5FVG784M35LUeQ')
                .end((err, res) => {
                    console.log('res:',res.text);
                    expect(res).to.not.be.an('undefined');
                    if (res !== undefined) {
                        expect(res).to.have.status(200);
                    }
                    return model.brands
                        .findOne({ where: data })
                        .then((result) => {
                            expect(result).to.not.be.an('undefined');
                            done();
                        })
                        .catch((err) => {
                            expect(err).to.not.be.an('undefined');
                            done();
                        });
                });
        });
    });
});