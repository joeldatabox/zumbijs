var Superagent = require('superagent');
var Request = require('../request');
var Get = function (uri) {
    request = new Request(uri);

    this.query = function (key, value) {
        request.addQueryParam(key, value);
        return this;
    };

    this.path = function(path){
        request.addPathParam(path);
        return this;
    };

    this.header = function (key, value) {
        if(k)
        request.addHeader(key, value);
        return this;
    };

    this.accept = function (accpet) {
        request.accept(accpet);
        return this;
    };

    this.exec = function (callback) {
        var req = request.buildRequest();
        var agent = Superagent.get(req.url);
        Object.keys(req.header).forEach(function (key) {
            agent.set(key, req.header[key]);
        });
        agent.end(
            callback
        );
    };
};

module.exports = Get;

