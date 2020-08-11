var optimizelyWebXEvents = require('./optimizely-x-defined-events');
var optimizelyFullStackEvents = require('./optimizely-fs-defined-events');

function EventHandler(common) {
    this.common = common || {};
}

EventHandler.prototype.logEvent = function(event) {
    if (optimizelyWebXEvents.events[event.EventName]) {
        var optimizelyWebXEvent = {
            type: 'event',
            eventName: event.EventName
        };

        if (event.EventAttributes) {
            optimizelyWebXEvent.tags = event.EventAttributes;
        }

        if (event.CustomFlags && event.CustomFlags['Optimizely.Value']) {
            optimizelyWebXEvent.tags.value = event.CustomFlags['Optimizely.Value'];
        }
        window['optimizely'].push(optimizelyWebXEvent);
    }

    // if optimizely full stack is being used
    if (window.optimizelyClientInstance) {
        var eventKey = event.EventName,
            userId,
            userAttributes = this.common.userAttributes,
            eventTags = {};

        if (window.mParticle && window.mParticle.Identity) {
            var userIdentities = window.mParticle.Identity.getCurrentUser().getUserIdentities()['userIdentites'];

            switch(this.forwarderSettings.userIdField) {
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
                    // this should never hit, since a user is required to select from a userId type from the userIdField dropdown
                    userId = null;
            }
        }

        if (event.EventAttributes) {
            eventTags = event.EventAttributes;
        }

        if (event.CustomFlags && event.CustomFlags['OptimizelyFullStack.Value']) {
            eventTags.value = event.CustomFlags['OptimizelyFullStack.Value'];
        }

        window['optimizelyClientInstance'].track(eventKey, userId, userAttributes, eventTags);
    }
};

EventHandler.prototype.logPageView = function(event) {
    if (optimizelyWebXEvents.pages[event.EventName]) {
        var optimizelyWebXEvent = {
            type: 'page',
            pageName: event.EventName
        };

        if (event.EventAttributes) {
            optimizelyWebXEvent.tags = event.EventAttributes;
        }
        window['optimizely'].push(optimizelyWebXEvent);
    }
};

module.exports = EventHandler;
