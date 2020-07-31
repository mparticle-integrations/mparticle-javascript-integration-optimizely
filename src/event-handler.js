var optimizelyEvents = require('./optimizely-defined-events');
var optimizelyFullStackEvents = require('./optimizely-fs-defined-events');
const { initForwarder } = require('./initialization');

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

    if (optimizelyFullStackEvents.events[event.EventName]) {
        var eventKey = event.EventName,
            userId,
            userAttributes = {},
            eventTags = {};

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

        if (event.EventAttributes) {
            userAttributes = event.EventAttributes;
        }

        if (event.CustomFlags && event.CustomFlags['OptimizelyFullStack.Value']) {
            eventTags.value = event.CustomFlags['OptimizelyFullStack.Value'];
        }

        window['optimizelyClientInstance'].track(eventKey, userId, userAttributes, eventTags);
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
