var optimizelyEvents = require('./optimizely-defined-events');

function CommerceHandler(common) {
    this.common = common || {};
}

CommerceHandler.prototype.logCommerceEvent = function(event) {
    var expandedEcommerceEvents = mParticle.eCommerce.expandCommerceEvent(
        event
    );
    expandedEcommerceEvents.forEach(function(expandedEvent) {
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
    });
};

module.exports = CommerceHandler;
