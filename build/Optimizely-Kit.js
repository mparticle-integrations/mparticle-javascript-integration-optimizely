(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

var Common = require('../../../src/common');
var CommerceHandler = require('../../../src/commerce-handler');
var EventHandler = require('../../../src/event-handler');
var IdentityHandler = require('../../../src/identity-handler');
var Initialization = require('../../../src/initialization');
var SessionHandler = require('../../../src/session-handler');
var UserAttributeHandler = require('../../../src/user-attribute-handler');

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
        self.common = new Common();

        function initForwarder(settings, service, testMode, trackerId, userAttributes, userIdentities) {
            forwarderSettings = settings;

            if (window.mParticle.isTestEnvironment) {
                reportingService = function() {
                };
            } else {
                reportingService = service;
            }

            try {
                Initialization.initForwarder(settings, testMode, userAttributes, userIdentities, processEvent, eventQueue, isInitialized, self.common);
                self.eventHandler = new EventHandler(self.common);
                self.identityHandler = new IdentityHandler(self.common);
                self.userAttributeHandler = new UserAttributeHandler(self.common);
                self.commerceHandler = new CommerceHandler(self.common);

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
                self.eventHandler.logError(event);
                return true;
            } catch (e) {
                return {error: 'Error logging error on forwarder ' + name + '; ' + e};
            }
        }

        function logPageView(event) {
            try {
                self.eventHandler.logPageView(event);
                return true;
            } catch (e) {
                return {error: 'Error logging page view on forwarder ' + name + '; ' + e};
            }
        }

        function logEvent(event) {
            try {
                self.eventHandler.logEvent(event);
                return true;
            } catch (e) {
                return {error: 'Error logging event on forwarder ' + name + '; ' + e};
            }
        }

        function logEcommerceEvent(event) {
            try {
                self.commerceHandler.logCommerceEvent(event);
                return true;
            } catch (e) {
                return {error: 'Error logging purchase event on forwarder ' + name + '; ' + e};
            }
        }

        function setUserAttribute(key, value) {
            if (isInitialized) {
                try {
                    self.userAttributeHandler.onSetUserAttribute(key, value, forwarderSettings);
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
                    self.userAttributeHandler.onRemoveUserAttribute(key, forwarderSettings);
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
                    self.identityHandler.onSetUserIdentity(forwarderSettings, id, type);
                    return 'Successfully set user Identity on forwarder ' + name;
                } catch (e) {
                    return 'Error removing user attribute on forwarder ' + name + '; ' + e;
                }
            } else {
                return 'Can\'t call setUserIdentity on forwarder ' + name + ', not initialized';
            }

        }

        function onUserIdentified(user) {
            if (isInitialized) {
                try {
                    self.identityHandler.onUserIdentified(user);

                    return 'Successfully called onUserIdentified on forwarder ' + name;
                } catch (e) {
                    return {error: 'Error calling onUserIdentified on forwarder ' + name + '; ' + e};
                }
            }
            else {
                return 'Can\'t set new user identities on forwader  ' + name + ', not initialized';
            }
        }

        function onIdentifyComplete(user, filteredIdentityRequest) {
            if (isInitialized) {
                try {
                    self.identityHandler.onIdentifyComplete(user, filteredIdentityRequest);

                    return 'Successfully called onIdentifyComplete on forwarder ' + name;
                } catch (e) {
                    return {error: 'Error calling onIdentifyComplete on forwarder ' + name + '; ' + e};
                }
            }
            else {
                return 'Can\'t call onIdentifyCompleted on forwader  ' + name + ', not initialized';
            }
        }

        function onLoginComplete(user, filteredIdentityRequest) {
            if (isInitialized) {
                try {
                    self.identityHandler.onLoginComplete(user, filteredIdentityRequest);

                    return 'Successfully called onLoginComplete on forwarder ' + name;
                } catch (e) {
                    return {error: 'Error calling onLoginComplete on forwarder ' + name + '; ' + e};
                }
            }
            else {
                return 'Can\'t call onLoginComplete on forwader  ' + name + ', not initialized';
            }
        }

        function onLogoutComplete(user, filteredIdentityRequest) {
            if (isInitialized) {
                try {
                    self.identityHandler.onLogoutComplete(user, filteredIdentityRequest);

                    return 'Successfully called onLogoutComplete on forwarder ' + name;
                } catch (e) {
                    return {error: 'Error calling onLogoutComplete on forwarder ' + name + '; ' + e};
                }
            }
            else {
                return 'Can\'t call onLogoutComplete on forwader  ' + name + ', not initialized';
            }
        }

        function onModifyComplete(user, filteredIdentityRequest) {
            if (isInitialized) {
                try {
                    self.identityHandler.onModifyComplete(user, filteredIdentityRequest);

                    return 'Successfully called onModifyComplete on forwarder ' + name;
                } catch (e) {
                    return {error: 'Error calling onModifyComplete on forwarder ' + name + '; ' + e};
                }
            }
            else {
                return 'Can\'t call onModifyComplete on forwader  ' + name + ', not initialized';
            }
        }

        function setOptOut(isOptingOutBoolean) {
            if (isInitialized) {
                try {
                    self.initialization.setOptOut(isOptingOutBoolean);

                    return 'Successfully called setOptOut on forwarder ' + name;
                } catch (e) {
                    return {error: 'Error calling setOptOut on forwarder ' + name + '; ' + e};
                }
            }
            else {
                return 'Can\'t call setOptOut on forwader  ' + name + ', not initialized';
            }
        }

        this.init = initForwarder;
        this.process = processEvent;
        this.setUserAttribute = setUserAttribute;
        this.removeUserAttribute = removeUserAttribute;
        this.onUserIdentified = onUserIdentified;
        this.setUserIdentity = setUserIdentity;
        this.onIdentifyComplete = onIdentifyComplete;
        this.onLoginComplete = onLoginComplete;
        this.onLogoutComplete = onLogoutComplete;
        this.onModifyComplete = onModifyComplete;
        this.setOptOut = setOptOut;
    };

    if (!window || !window.mParticle || !window.mParticle.addForwarder) {
        return;
    }

    window.mParticle.addForwarder({
        name: name,
        constructor: constructor
    });
})(window);

},{"../../../src/commerce-handler":2,"../../../src/common":3,"../../../src/event-handler":4,"../../../src/identity-handler":5,"../../../src/initialization":6,"../../../src/session-handler":8,"../../../src/user-attribute-handler":9}],2:[function(require,module,exports){
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

},{"./optimizely-defined-events":7}],3:[function(require,module,exports){
function Common() {}

module.exports = Common;

},{}],4:[function(require,module,exports){
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

},{"./optimizely-defined-events":7}],5:[function(require,module,exports){
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

function IdentityHandler(common) {
    this.common = common || {};
}
IdentityHandler.prototype.onIdentifyCompleted = function(
    mParticleUser,
    identityApiRequest
) {};
IdentityHandler.prototype.onLoginCompleted = function(
    mParticleUser,
    identityApiRequest
) {};
IdentityHandler.prototype.onLogoutCompleted = function(
    mParticleUser,
    identityApiRequest
) {};
IdentityHandler.prototype.onModifyCompleted = function(
    mParticleUser,
    identityApiRequest
) {};
IdentityHandler.prototype.onUserIdentified = function(
    mParticleUser,
    identityApiRequest
) {};

/*  In previous versions of the mParticle web SDK, setting user identities on
    kits is only reachable via the onSetUserIdentity method below. We recommend
    filling out `onSetUserIdentity` for maximum compatibility
*/
IdentityHandler.prototype.onSetUserIdentity = function(
    forwarderSettings,
    id,
    type
) {};

module.exports = IdentityHandler;

},{}],6:[function(require,module,exports){
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

},{"./optimizely-defined-events":7}],7:[function(require,module,exports){
module.exports = {
    pages: {},
    events: {}
};

},{}],8:[function(require,module,exports){
var sessionHandler = {
    onSessionStart: function(event) {
        
    },
    onSessionEnd: function(event) {

    }
};

module.exports = sessionHandler;

},{}],9:[function(require,module,exports){
function UserAttributeHandler(common) {
    this.common = common = {};
}

UserAttributeHandler.prototype.onRemoveUserAttribute = function(key) {
    var attribute = {};
    attribute[key] = null;
    window['optimizely'].push({
        type: 'user',
        attributes: attribute
    });
};
UserAttributeHandler.prototype.onSetUserAttribute = function(key, value) {
    var attribute = {};
    attribute[key] = value;
    window['optimizely'].push({
        type: 'user',
        attributes: attribute
    });
};

module.exports = UserAttributeHandler;

},{}]},{},[1]);
