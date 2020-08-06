var optimizelyEvents = require('./optimizely-defined-events');
var optimizelyFullStackEvents = require('./optimizely-fs-defined-events');
var helpers = require('./helpers');

var initialization = {
    name: 'Optimizely',
    moduleId: 54,
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

                    loadWebXEventsAndPages();

                    if (window['optimizely'] && eventQueue.length > 0) {
                        for (var i = 0; i < eventQueue.length; i++) {
                            processEvent(eventQueue[i]);
                        }
                        eventQueue = [];
                    }
                };
            } else {
                isInitialized = true;
                loadWebXEventsAndPages();
            }

            if (settings.sdkKey && !window.optimizelyClientInstance) {
                var instantiateFSClient = function() {
                    var optimizelyClientInstance = window.optimizelySdk.createInstance({
                        datafile: window.optimizelyDatafile
                    });

                    optimizelyClientInstance.onReady().then(() => {
                        isInitialized = true;
                        loadFullStackEvents();
                    });  
                }

                helpers.loadScript('https://unpkg.com/@optimizely/optimizely-sdk/dist/optimizely.browser.umd.min.js', 
                helpers.loadScript('https://cdn.optimizely.com/datafiles/' + settings.sdkKey + '.json/tag.js', instantiateFSClient));

            } else {
                isInitialized = true;
                loadFullStackEvents();
            }            
        } else {
            isInitialized = true;
            if (settings.projectId) {
                loadWebXEventsAndPages();
            }
            if (settings.sdkKey) {
                loadFullStackEvents();
            }
        }
    }
};

function loadWebXEventsAndPages() {
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

function loadFullStackEvents() {
    var fullStackData,
    fullStackEvents = {};

    if (window.optimizelyDatafile) {
        fullStackData = helpers.arrayToObject(window.optimizelyDatafile.events, "id");

        for (var event in fullStackData) {
            fullStackEvents[fullStackData[event].key] = 1;
        }

        optimizelyFullStackEvents.events = fullStackEvents;
    }
}

module.exports = initialization;
