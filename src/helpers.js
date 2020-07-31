var helpers = {
    arrayToObject: function(array, keyField) {
        var newObj = array.reduce(function(obj, item) {
            obj[item[keyField]] = item;
            return obj;
        }, {});
    return newObj;
    },
};

module.exports = helpers;