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
