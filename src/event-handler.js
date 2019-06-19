var optimizelyEvents = require('./optimizely-defined-events');

function EventHandler(common) {
    this.common = common || {};
}

EventHandler.prototype.logEvent = function(event) {
    if (optimizelyEvents.events[event.EventName]) {
        var optimizelyEvent = {
            type: 'event',
            eventName: event.EventName
        };

        if (event.EventAttributes) {
            optimizelyEvent.tags = event.EventAttributes;
        }

        if (event.CustomFlags && event.CustomFlags['Optimizely.Value']) {
            optimizelyEvent.tags.value = event.CustomFlags['Optimizely.Value'];
        }
        window['optimizely'].push(optimizelyEvent);
    }
};
EventHandler.prototype.logPageView = function(event) {
    if (optimizelyEvents.pages[event.EventName]) {
        var optimizelyEvent = {
            type: 'page',
            pageName: event.EventName
        };

        if (event.EventAttributes) {
            optimizelyEvent.tags = event.EventAttributes;
        }
        window['optimizely'].push(optimizelyEvent);
    }
};

module.exports = EventHandler;
