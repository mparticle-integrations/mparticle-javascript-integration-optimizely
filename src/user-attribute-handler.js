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
    if (window.optimizelyClientInstance) {
        if (this.common.userAttributes[key]) {
            delete this.common.userAttributes[key];
        }
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
    if (window.optimizelyClientInstance) {
        this.common.userAttributes[key] = value;
    }    
};

module.exports = UserAttributeHandler;
