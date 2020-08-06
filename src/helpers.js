var helpers = {
    arrayToObject: function(array, keyField) {
        var newObj = array.reduce(function(obj, item) {
            obj[item[keyField]] = item;
            return obj;
        }, {});
    return newObj;
    },
    loadScript: function(src, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.onload = callback;
        script.src = src;
        document.head.appendChild(script);
    },
};

module.exports = helpers;