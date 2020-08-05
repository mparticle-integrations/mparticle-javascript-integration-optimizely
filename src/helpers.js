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
      
        // IE
        if (script.readyState) {
          script.onreadystatechange = function () {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              callback();
            }
          }
        }
        // other browsers
        else {
          script.onload = callback;
        }
      
        script.src = src;
        document.head.appendChild(script);
    },
};

module.exports = helpers;