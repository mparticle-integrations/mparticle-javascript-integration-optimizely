var optimizelyEvents = require('./optimizely-defined-events');
var optimizelyFullStackEvents = require('./optimizely-fs-defined-events');

function CommerceHandler(common) {
    this.common = common || {};
}

CommerceHandler.prototype.logCommerceEvent = function(event) {
    var expandedEcommerceEvents = mParticle.eCommerce.expandCommerceEvent(
        event
    );
    expandedEcommerceEvents.forEach(function(expandedEvent) {

        if (optimizelyEvents.events[expandedEvent.EventName]) {

            var optimizelyEvent = {
                type: 'event',
                eventName: event.EventName,
                tags: {}
            };
            optimizelyEvent.tags = expandedEvent.EventAttributes || {};
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
                        optimizelyEvent.eventName =
                            event.CustomFlags['Optimizely.EventName'];
                    } else {
                        optimizelyEvent.eventName = expandedEvent.EventName;
                    }
                    // Overall purchase event
                    if (
                        expandedEvent.EventAttributes &&
                        expandedEvent.EventAttributes['Total Amount']
                    ) {
                        optimizelyEvent.tags.revenue =
                            expandedEvent.EventAttributes['Total Amount'] * 100;
                    }
                    // other individual product events should not have revenue tags
                    // which are added via the expandCommerceEvent method above
                } else {
                    optimizelyEvent.eventName = expandedEvent.EventName;
                    if (optimizelyEvent.tags.revenue) {
                        delete optimizelyEvent.tags.revenue;
                    }
                    if (optimizelyEvent.tags.Revenue) {
                        delete optimizelyEvent.tags.Revenue;
                    }
                }
            } else {
                optimizelyEvent.eventName = expandedEvent.EventName;
                if (
                    event.CustomFlags &&
                    event.CustomFlags['Optimizely.EventName']
                ) {
                    optimizelyEvent.eventName =
                        event.CustomFlags['Optimizely.EventName'];
                }
            }

            // Events that are added to the OptimizelyUI will be available on optimizelyEvents.events
            // Ignore events not included in the Optimizely UI
            if (optimizelyEvents.events[optimizelyEvent.eventName]) {
                var eventCopy = {};
                for (var key in optimizelyEvent) {
                    eventCopy[key] = optimizelyEvent[key];
                }
                window['optimizely'].push(eventCopy);
            }
        }

        // if optimizely full stack is being used
        if (window.optimizelyClientInstance) {
            var eventKey = event.EventName,
            userId,
            userAttributes = {},
            eventTags = {};

            userAttributes = expandedEvent.EventAttributes || {};

            if (window.mParticle && window.mParticle.Identity) {
                var userIdentities = window.mParticle.Identity.getCurrentUser().getUserIdentities()['userIdentites'];
    
                switch(forwarderSettings.userIdField) {
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

            window['optimizelyClientInstance'].track(eventKey, userId, userAttributes, eventTags);
        }

    });
};

module.exports = CommerceHandler;
