(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var optimizelyEvents = require('./optimizely-defined-events');

var commerceHandler = {
    logCommerceEvent: function(event) {
        var expandedEcommerceEvents = mParticle.eCommerce.expandCommerceEvent(event);
        expandedEcommerceEvents.forEach(function(expandedEvent) {
            var optimizelyEvent = {
                type: 'event',
                eventName: event.EventName,
                tags: {}
            };
            optimizelyEvent.tags = expandedEvent.EventAttributes || {};
            if (event.EventCategory === mParticle.CommerceEventType.ProductPurchase ||
                event.EventCategory === mParticle.CommerceEventType.ProductRefund) {
                if (expandedEvent.EventName.indexOf('Total') > -1) {
                    if (event.CustomFlags && event.CustomFlags['Optimizely.EventName']) {
                        optimizelyEvent.eventName = event.CustomFlags['Optimizely.EventName'];
                    } else {
                        optimizelyEvent.eventName = expandedEvent.EventName;
                    }
                    // Overall purchase event
                    if (expandedEvent.EventAttributes && expandedEvent.EventAttributes['Total Amount']) {
                        optimizelyEvent.tags.revenue = expandedEvent.EventAttributes['Total Amount'] * 100;
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
                if (event.CustomFlags && event.CustomFlags['Optimizely.EventName']) {
                    optimizelyEvent.eventName = event.CustomFlags['Optimizely.EventName'];
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
    }
};

module.exports = commerceHandler;

},{"./optimizely-defined-events":5}],2:[function(require,module,exports){
var optimizelyEvents = require('./optimizely-defined-events');

var eventHandler = {
    logEvent: function(event) {
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
    },
    logPageView: function(event) {
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
    }
};

module.exports = eventHandler;

},{"./optimizely-defined-events":5}],3:[function(require,module,exports){
/*
The 'mParticleUser' is an object with methods get user Identities and set/get user attributes
Partners can determine what userIds are available to use in their SDK
Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
For more identity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
Call mParticleUser.getMPID() to get mParticle ID
For any additional methods, see http://docs.mparticle.com/developers/sdk/javascript/apidocs/classes/mParticle.Identity.getCurrentUser().html
*/


/*
identityApiRequest has the schema:
{
  userIdentities: {
    customerid: '123',
    email: 'abc'
  }
}
For more userIdentity types, see http://docs.mparticle.com/developers/sdk/javascript/identity#allowed-identity-types
*/

var identityHandler = {
    onUserIdentified: function(mParticleUser) {
    },
    onIdentifyCompleted: function(mParticleUser, identityApiRequest) {

    },
    onLoginCompleted: function(mParticleUser, identityApiRequest) {

    },
    onLogoutCompleted: function(mParticleUser, identityApiRequest) {

    },
    onModifyCompleted: function(mParticleUser, identityApiRequest) {

    },

/*  In previous versions of the mParticle web SDK, setting user identities on
    kits is only reachable via the onSetUserIdentity method below. We recommend
    filling out `onSetUserIdentity` for maximum compatibility.
*/
    onSetUserIdentity: function(forwarderSettings, id, type) {

    }
};

module.exports = identityHandler;

},{}],4:[function(require,module,exports){
var optimizelyEvents = require('./optimizely-defined-events');

var initialization = {
    name: 'Optimizely',
    initForwarder: function(settings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized) {
        if (!testMode) {
            if (!window.optimizely) {
                var optimizelyScript = document.createElement('script');
                optimizelyScript.type = 'text/javascript';
                optimizelyScript.async = true;
                optimizelyScript.src = 'https://cdn.optimizely.com/js/' + settings.projectId + '.js';
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(optimizelyScript);
                optimizelyScript.onload = function() {
                    isInitialized = true;

                    loadEventsAndPages();

                    if (window['optimizely'] && eventQueue.length > 0) {
                        for (var i = 0; i < eventQueue.length; i++) {
                            processEvent(eventQueue[i]);
                        }
                        eventQueue = [];
                    }
                };
            } else {
                isInitialized = true;
                loadEventsAndPages();
            }
        } else {
            isInitialized = true;
            loadEventsAndPages();
        }
    }
};

function loadEventsAndPages() {
    var data,
        events = {},
        pages = {};

    if (window.optimizely) {
        data = window.optimizely.get('data');

        for (var event in data.events) {
            events[data.events[event].apiName] = 1;
        }

        for (var page in data.pages) {
            pages[data.pages[page].apiName] = 1;
        }

        optimizelyEvents.events = events;
        optimizelyEvents.pages = pages;
    }
}

module.exports = initialization;

},{"./optimizely-defined-events":5}],5:[function(require,module,exports){
module.exports = {
    pages: {},
    events: {}
};

},{}],6:[function(require,module,exports){
var sessionHandler = {
    onSessionStart: function(event) {
        
    },
    onSessionEnd: function(event) {

    }
};

module.exports = sessionHandler;

},{}],7:[function(require,module,exports){
var identityHandler = {
    onRemoveUserAttribute: function(key) {
        var attribute = {};
        attribute[key] = null;
        window['optimizely'].push({
            type: 'user',
            attributes: attribute
        });
    },
    onSetUserAttribute: function(key, value) {
        var attribute = {};
        attribute[key] = value;
        window['optimizely'].push({
            type: 'user',
            attributes: attribute
        });
    }
};

module.exports = identityHandler;

},{}],8:[function(require,module,exports){
// =============== REACH OUT TO MPARTICLE IF YOU HAVE ANY QUESTIONS ===============
//
//  Copyright 2018 mParticle, Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
var CommerceHandler = require('../../../integration-builder/commerce-handler');
var EventHandler = require('../../../integration-builder/event-handler');
var IdentityHandler = require('../../../integration-builder/identity-handler');
var Initialization = require('../../../integration-builder/initialization');
var SessionHandler = require('../../../integration-builder/session-handler');
var UserAttributeHandler = require('../../../integration-builder/user-attribute-handler');

(function (window) {
    var name = Initialization.name,
        MessageType = {
            SessionStart: 1,
            SessionEnd: 2,
            PageView: 3,
            PageEvent: 4,
            CrashReport: 5,
            OptOut: 6,
            Commerce: 16
        };

    var constructor = function () {
        var self = this,
            isInitialized = false,
            forwarderSettings,
            reportingService,
            eventQueue = [];

        self.name = Initialization.name;

        function initForwarder(settings, service, testMode, trackerId, userAttributes, userIdentities) {
            forwarderSettings = settings;
            reportingService = service;

            try {
                Initialization.initForwarder(settings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized);
                isInitialized = true;
            } catch (e) {
                console.log('Failed to initialize ' + name + ' - ' + e);
            }
        }

        function processEvent(event) {
            var reportEvent = false;
            if (isInitialized) {
                try {
                    if (event.EventDataType === MessageType.SessionStart) {
                        reportEvent = logSessionStart(event);
                    } else if (event.EventDataType === MessageType.SessionEnd) {
                        reportEvent = logSessionEnd(event);
                    } else if (event.EventDataType === MessageType.CrashReport) {
                        reportEvent = logError(event);
                    } else if (event.EventDataType === MessageType.PageView) {
                        reportEvent = logPageView(event);
                    }
                    else if (event.EventDataType === MessageType.Commerce) {
                        reportEvent = logEcommerceEvent(event);
                    }
                    else if (event.EventDataType === MessageType.PageEvent) {
                        reportEvent = logEvent(event);
                    }
                    if (reportEvent === true && reportingService) {
                        reportingService(self, event);
                        return 'Successfully sent to ' + name;
                    }
                    else {
                        return 'Error logging event or event type not supported on forwarder ' + name;
                    }
                }
                catch (e) {
                    return 'Failed to send to ' + name + ' ' + e;
                }
            } else {
                eventQueue.push(event);
                return 'Can\'t send to forwarder ' + name + ', not initialized. Event added to queue.';
            }
        }

        function logSessionStart(event) {
            try {
                SessionHandler.onSessionStart(event);
                return true;
            } catch (e) {
                return {error: 'Error starting session on forwarder ' + name + '; ' + e};
            }
        }

        function logSessionEnd(event) {
            try {
                SessionHandler.onSessionEnd(event);
                return true;
            } catch (e) {
                return {error: 'Error ending session on forwarder ' + name + '; ' + e};
            }
        }

        function logError(event) {
            try {
                EventHandler.logError(event);
                return true;
            } catch (e) {
                return {error: 'Error logging error on forwarder ' + name + '; ' + e};
            }
        }

        function logPageView(event) {
            try {
                EventHandler.logPageView(event);
                return true;
            } catch (e) {
                return {error: 'Error logging page view on forwarder ' + name + '; ' + e};
            }
        }

        function logEvent(event) {
            try {
                EventHandler.logEvent(event);
                return true;
            } catch (e) {
                return {error: 'Error logging event on forwarder ' + name + '; ' + e};
            }
        }

        function logEcommerceEvent(event) {
            try {
                CommerceHandler.logCommerceEvent(event);
                return true;
            } catch (e) {
                return {error: 'Error logging purchase event on forwarder ' + name + '; ' + e};
            }
        }

        function setUserAttribute(key, value) {
            if (isInitialized) {
                try {
                    UserAttributeHandler.onSetUserAttribute(key, value, forwarderSettings);
                    return 'Successfully set user attribute on forwarder ' + name;
                } catch (e) {
                    return 'Error setting user attribute on forwarder ' + name + '; ' + e;
                }
            } else {
                return 'Can\'t set user attribute on forwarder ' + name + ', not initialized';
            }
        }

        function removeUserAttribute(key) {
            if (isInitialized) {
                try {
                    UserAttributeHandler.onRemoveUserAttribute(key, forwarderSettings);
                    return 'Successfully removed user attribute on forwarder ' + name;
                } catch (e) {
                    return 'Error removing user attribute on forwarder ' + name + '; ' + e;
                }
            } else {
                return 'Can\'t remove user attribute on forwarder ' + name + ', not initialized';
            }
        }

        function setUserIdentity(id, type) {
            if (isInitialized) {
                try {
                    IdentityHandler.onSetUserIdentity(forwarderSettings, id, type);
                    return 'Successfully set user Identity on forwarder ' + name;
                } catch (e) {
                    return 'Error removing user attribute on forwarder ' + name + '; ' + e;
                }
            } else {
                return 'Can\'t call setUserIdentity on forwarder ' + name + ', not initialized';
            }

        }

        function onUserIdentified(user, method) {
            var identityMapping = {
                modify: 'onModifyCompleted',
                identify: 'onIdentifyCompleted',
                login: 'onLoginCompleted',
                logout: 'onLogoutCompleted'
            };
            if (isInitialized) {
                try {
                    if (method) {
                        IdentityHandler[identityMapping[method]](user, forwarderSettings);
                    } else {
                        IdentityHandler.onUserIdentified(user, forwarderSettings);
                    }

                    return 'Successfully set user Identity on forwarder ' + name;
                } catch (e) {
                    return {error: 'Error setting user identity on forwarder ' + name + '; ' + e};
                }
            }
            else {
                return 'Can\'t set new user identities on forwader  ' + name + ', not initialized';
            }
        }

        this.init = initForwarder;
        this.process = processEvent;
        this.setUserAttribute = setUserAttribute;
        this.removeUserAttribute = removeUserAttribute;
        this.onUserIdentified = onUserIdentified;
        this.setUserIdentity = setUserIdentity;
    };

    if (!window || !window.mParticle || !window.mParticle.addForwarder) {
        return;
    }

    window.mParticle.addForwarder({
        name: name,
        constructor: constructor
    });
})(window);

},{"../../../integration-builder/commerce-handler":1,"../../../integration-builder/event-handler":2,"../../../integration-builder/identity-handler":3,"../../../integration-builder/initialization":4,"../../../integration-builder/session-handler":6,"../../../integration-builder/user-attribute-handler":7}]},{},[8]);
