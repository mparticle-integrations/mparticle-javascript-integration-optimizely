function UserAttributeHandler(common) {
    this.common = common = {};
}

UserAttributeHandler.prototype.onRemoveUserAttribute = function(key) {
    if (window.optimizely) {
        var attribute = {};
        attribute[key] = null;
        window['optimizely'].push({
            type: 'user',
            attributes: attribute
        });
    }
};
UserAttributeHandler.prototype.onSetUserAttribute = function(key, value) {
    if (window.optimizely) {
        var attribute = {};
        attribute[key] = value;
        window['optimizely'].push({
            type: 'user',
            attributes: attribute
        });
    }
};

module.exports = UserAttributeHandler;
