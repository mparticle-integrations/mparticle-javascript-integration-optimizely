var optimizelyWebXEvents = require('./optimizely-x-defined-events');
var optimizelyFullStackEvents = require('./optimizely-fs-defined-events');

function CommerceHandler(common) {
    this.common = common || {};
}

CommerceHandler.prototype.logCommerceEvent = function(event) {
    var self = this;
    var expandedEcommerceEvents = mParticle.eCommerce.expandCommerceEvent(
        event
    );
    expandedEcommerceEvents.forEach(function(expandedEvent) {

        if (optimizelyWebXEvents.events[expandedEvent.EventName]) {

            var optimizelyWebXEvent = {
                type: 'event',
                eventName: event.EventName,
                tags: {}
            };
            optimizelyWebXEvent.tags = expandedEvent.EventAttributes || {};
            if (
                event.EventCategory ===
                    mParticle.CommerceEventType.ProductPurchase ||
                event.EventCategory === mParticle.CommerceEventType.ProductRefund
            ) {
                if (expandedEvent.EventName.indexOf('Total') > -1) {
                    if (
                        event.CustomFlags &&
                        event.CustomFlags['Optimizely.EventName']
                    ) {
                        optimizelyWebXEvent.eventName =
                            event.CustomFlags['Optimizely.EventName'];
                    } else {
                        optimizelyWebXEvent.eventName = expandedEvent.EventName;
                    }
                    // Overall purchase event
                    if (
                        expandedEvent.EventAttributes &&
                        expandedEvent.EventAttributes['Total Amount']
                    ) {
                        optimizelyWebXEvent.tags.revenue =
                            expandedEvent.EventAttributes['Total Amount'] * 100;
                    }
                    // other individual product events should not have revenue tags
                    // which are added via the expandCommerceEvent method above
                } else {
                    optimizelyWebXEvent.eventName = expandedEvent.EventName;
                    if (optimizelyWebXEvent.tags.revenue) {
                        delete optimizelyWebXEvent.tags.revenue;
                    }
                    if (optimizelyWebXEvent.tags.Revenue) {
                        delete optimizelyWebXEvent.tags.Revenue;
                    }
                }
            } else {
                optimizelyWebXEvent.eventName = expandedEvent.EventName;
                if (
                    event.CustomFlags &&
                    event.CustomFlags['Optimizely.EventName']
                ) {
                    optimizelyWebXEvent.eventName =
                        event.CustomFlags['Optimizely.EventName'];
                }
            }

            // Events that are added to the OptimizelyUI will be available on optimizelyWebXEvents.events
            // Ignore events not included in the Optimizely UI
            if (optimizelyWebXEvents.events[optimizelyWebXEvent.eventName]) {
                var eventCopy = {};
                for (var key in optimizelyWebXEvent) {
                    eventCopy[key] = optimizelyWebXEvent[key];
                }
                window['optimizely'].push(eventCopy);
            }
        }

        // if optimizely full stack is being used
        if (window.optimizelyClientInstance) {
            if (optimizelyFullStackEvents.events[expandedEvent.EventName]) {
                var eventKey = event.EventName,
                userId,
                userAttributes = self.common.userAttributes,
                eventTags = {};

                eventTags = expandedEvent.EventAttributes || {};

                if (window.mParticle && window.mParticle.Identity) {
                    var userIdentities = window.mParticle.Identity.getCurrentUser().getUserIdentities()['userIdentites'];
        
                    switch(self.common.userIdField) {
                        case 'customerId':
                            userId = userIdentities["customerId"];
                            break;
                        case 'email':
                            userId = userIdentities["email"];
                            break;
                        case 'mpid':
                            userId = userIdentities["mpid"];
                            break;
                        case 'other':
                            userId = userIdentities["other"];
                            break;
                        case 'other2':
                            userId = userIdentities["other2"];
                            break;
                        case 'other3':
                            userId = userIdentities["other3"];
                            break;
                        case 'other4':
                            userId = userIdentities["other4"];
                            break;
                        default:
                            userId = null;
                    }
                }

                if (
                    event.EventCategory ===
                        mParticle.CommerceEventType.ProductPurchase ||
                    event.EventCategory === mParticle.CommerceEventType.ProductRefund
                ) {
                    if (expandedEvent.EventName.indexOf('Total') > -1) {
                            eventKey = expandedEvent.EventName;

                        // Overall purchase event
                        if (
                            expandedEvent.EventAttributes &&
                            expandedEvent.EventAttributes['Total Amount']
                        ) {
                            eventTags.revenue =
                                expandedEvent.EventAttributes['Total Amount'] * 100;
                        }
                        // other individual product events should not have revenue tags
                        // which are added via the expandCommerceEvent method above
                    } else {
                        eventKey = expandedEvent.EventName;
                        if (eventTags.revenue) {
                            delete eventTags.revenue;
                        }
                    }
                } else {
                    eventKey = expandedEvent.EventName;
                }
            }

            window['optimizelyClientInstance'].track(eventKey, userId, userAttributes, eventTags);
        }

    });
};

module.exports = CommerceHandler;
