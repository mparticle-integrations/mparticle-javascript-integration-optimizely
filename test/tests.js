/* eslint-disable no-undef*/
describe('Optimizely Forwarder', function () {
    // -------------------DO NOT EDIT ANYTHING BELOW THIS LINE-----------------------
    var MessageType = {
            SessionStart: 1,
            SessionEnd: 2,
            PageView: 3,
            PageEvent: 4,
            CrashReport: 5,
            OptOut: 6,
            Commerce: 16
        },
        EventType = mParticle.EventType,
        CommerceEventType = mParticle.CommerceEventType,
        ProductActionType = mParticle.ProductActionType,
        IdentityType = mParticle.IdentityType,
        PromotionActionType = mParticle.PromotionType,
        ReportingService = function () {
            var self = this;

            this.id = null;
            this.event = null;

            this.cb = function (forwarder, event) {
                self.id = forwarder.id;
                self.event = event;
            };

            this.reset = function () {
                this.id = null;
                this.event = null;
            };
        },
        reportService = new ReportingService(),

// -------------------DO NOT EDIT ANYTHING ABOVE THIS LINE-----------------------
// -------------------START EDITING BELOW:-----------------------
        OptimizelyMockForwarder = function() {
            var self = this;
            this.eventQueue = [];
            this.push = function(event) {
                self.eventQueue.push(event);
            };
            this.get = function() {
                return {
                    pages: {
                        123: {apiName: 'test name', id: 123}},
                    events: {
                        234: {apiName: 'Test Event', id: 234},
                        345: {apiName: 'RevenueTestEventName', id: 345},
                        456: {apiName: 'eCommerce - purchase - Total', id: 456},
                        567: {apiName: 'eCommerce - purchase - Item', id: 567},
                        789: {apiName: 'eCommerce - add_to_cart - Item', id: 789},
                        890: {apiName: 'eCommerce - click - Item', id: 890}
                    }
                };
            };
        };

    before(function () {
        mParticle.init('fake-api-key', {workspaceToken: 'faketoken', requestConfig: false});
        mParticle.EventType = EventType;
        mParticle.ProductActionType = ProductActionType;
        mParticle.PromotionType = PromotionActionType;
        mParticle.IdentityType = IdentityType;
        mParticle.CommerceEventType = CommerceEventType;
    });

    beforeEach(function() {
        window.optimizely = new OptimizelyMockForwarder();
        // Include any specific settings that is required for initializing your SDK here
        var sdkSettings = {
            projectId: '123456'
        };
        // You may require userAttributes or userIdentities to be passed into initialization
        var userAttributes = {
            color: 'green'
        };
        var userIdentities = [{
            Identity: 'customerId',
            Type: IdentityType.CustomerId
        }, {
            Identity: 'email',
            Type: IdentityType.Email
        }, {
            Identity: 'facebook',
            Type: IdentityType.Facebook
        }];

        mParticle.forwarder.init(sdkSettings, reportService.cb, true, null, userAttributes, userIdentities);
    });

    it('should log a custom event', function(done) {
        mParticle.forwarder.process({
            EventDataType: MessageType.PageEvent,
            EventName: 'Test Event',
            EventAttributes: {
                label: 'label',
                value: 200,
                category: 'category'
            }
        });

        window.optimizely.eventQueue.length.should.equal(1);
        window.optimizely.eventQueue[0].type.should.equal('event');
        window.optimizely.eventQueue[0].eventName.should.equal('Test Event');
        window.optimizely.eventQueue[0].tags.label.should.equal('label');
        window.optimizely.eventQueue[0].tags.value.should.equal(200);
        window.optimizely.eventQueue[0].tags.category.should.equal('category');

        done();
    });

    it('should log page view', function(done) {
        mParticle.forwarder.process({
            EventDataType: MessageType.PageView,
            EventName: 'test name',
            EventAttributes: {
                attr1: 'test1',
                attr2: 'test2'
            }
        });

        window.optimizely.eventQueue.length.should.equal(1);
        window.optimizely.eventQueue[0].type.should.equal('page');
        window.optimizely.eventQueue[0].pageName.should.equal('test name');
        window.optimizely.eventQueue[0].tags.attr1.should.equal('test1');
        window.optimizely.eventQueue[0].tags.attr2.should.equal('test2');

        done();
    });

    it('should log a standard commerce event as default mParticle event name if no customFlags are passsed', function(done) {
        mParticle.forwarder.process({
            EventName: 'eCommerce - Purchase',
            EventDataType: MessageType.Commerce,
            EventCategory: CommerceEventType.ProductPurchase,
            ProductAction: {
                ProductActionType: ProductActionType.Purchase,
                ProductList: [
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    }
                ],
                TransactionId: 123,
                Affiliation: 'my-affiliation',
                TotalAmount: 450,
                TaxAmount: 40,
                ShippingAmount: 10,
                CouponCode: null
            }
        });

        window.optimizely.eventQueue.length.should.equal(2);
        window.optimizely.eventQueue[0].eventName.should.equal('eCommerce - purchase - Total');
        window.optimizely.eventQueue[0].type.should.equal('event');
        window.optimizely.eventQueue[0].tags.revenue.should.equal(45000);
        window.optimizely.eventQueue = [];

        mParticle.forwarder.process({
            EventName: 'eCommerce - AddToCart',
            EventDataType: MessageType.Commerce,
            EventCategory: CommerceEventType.ProductPurchase,
            ProductAction: {
                ProductActionType: ProductActionType.AddToCart,
                ProductList: [
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    },
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    }
                ]
            }
        });

        window.optimizely.eventQueue.length.should.equal(2);
        window.optimizely.eventQueue[0].eventName.should.equal('eCommerce - add_to_cart - Item');
        window.optimizely.eventQueue[0].type.should.equal('event');
        Should(window.optimizely.eventQueue[0].tags.revenue).not.be.ok();

        done();
    });

    it('should log a product purchase commerce with custom name if customFlag of Optimizely.EventName is passed', function(done) {
        mParticle.forwarder.process({
            EventName: 'eCommerce - Purchase',
            CustomFlags: {
                'Optimizely.EventName': 'RevenueTestEventName'
            },
            EventDataType: MessageType.Commerce,
            EventCategory: CommerceEventType.ProductPurchase,
            ProductAction: {
                ProductActionType: ProductActionType.Purchase,
                ProductList: [
                    {
                        Sku: '12345',
                        Name: 'iPhone 6',
                        Category: 'Phones',
                        Brand: 'iPhone',
                        Variant: '6',
                        Price: 400,
                        TotalAmount: 400,
                        CouponCode: 'coupon-code',
                        Quantity: 1
                    }
                ],
                TransactionId: 123,
                Affiliation: 'my-affiliation',
                TotalAmount: 450,
                TaxAmount: 40,
                ShippingAmount: 10,
                CouponCode: null
            }
        });
        window.optimizely.eventQueue.length.should.equal(2);
        window.optimizely.eventQueue[0].eventName.should.equal('RevenueTestEventName');
        window.optimizely.eventQueue[0].type.should.equal('event');
        window.optimizely.eventQueue[0].tags.revenue.should.equal(45000);
        window.optimizely.eventQueue[1].eventName.should.equal('eCommerce - purchase - Item');
        window.optimizely.eventQueue[1].type.should.equal('event');
        window.optimizely.eventQueue[1].tags.Id.should.equal('12345');
        window.optimizely.eventQueue[1].tags.Name.should.equal('iPhone 6');
        window.optimizely.eventQueue[1].tags.Variant.should.equal('6');
        Should(window.optimizely.eventQueue[1].tags.revenue).not.be.ok();

        done();
    });

    it('should log non-product purchases using mParticle default expanded commerce event name', function(done) {
        mParticle.forwarder.process({
            EventName: 'eCommerce - PromotionClick',
            EventDataType: MessageType.Commerce,
            EventCategory: mParticle.CommerceEventType.PromotionClick,
            PromotionAction: {
                PromotionActionType: mParticle.PromotionType.PromotionClick,
                PromotionList: [{
                    Creative: 'creative',
                    Id: 'id',
                    Name: 'promotion1'}]
            }
        });
        window.optimizely.eventQueue.length.should.equal(1);
        window.optimizely.eventQueue[0].eventName.should.equal('eCommerce - click - Item');
        window.optimizely.eventQueue[0].type.should.equal('event');
        window.optimizely.eventQueue[0].tags.Creative.should.equal('creative');
        window.optimizely.eventQueue[0].tags.Id.should.equal('id');
        window.optimizely.eventQueue[0].tags.Name.should.equal('promotion1');

        window.optimizely.eventQueue = [];


        done();
    });

    it('should log a value event to Optimizely', function(done) {
        mParticle.forwarder.process({
            CustomFlags: {
                'Optimizely.Value': 5
            },
            EventDataType: MessageType.PageEvent,
            EventName: 'Test Event',
            EventAttributes: {
                label: 'label',
                category: 'category'
            }
        });

        window.optimizely.eventQueue.length.should.equal(1);
        window.optimizely.eventQueue[0].type.should.equal('event');
        window.optimizely.eventQueue[0].eventName.should.equal('Test Event');
        window.optimizely.eventQueue[0].tags.label.should.equal('label');
        window.optimizely.eventQueue[0].tags.value.should.equal(5);
        window.optimizely.eventQueue[0].tags.category.should.equal('category');

        done();
    });

    it('should set and remove user attributes properly', function(done) {
        mParticle.forwarder.setUserAttribute('key', 'value');

        window.optimizely.eventQueue.length.should.equal(1);
        window.optimizely.eventQueue[0].type.should.equal('user');
        window.optimizely.eventQueue[0].attributes.key.should.equal('value');

        mParticle.forwarder.removeUserAttribute('key');

        window.optimizely.eventQueue.length.should.equal(2);
        window.optimizely.eventQueue[1].type.should.equal('user');
        (window.optimizely.eventQueue[1].attributes.key === null).should.equal(true);

        done();
    });
});
