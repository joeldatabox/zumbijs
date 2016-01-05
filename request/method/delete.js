var Superagent = require('superagent');
var Request = require('../request');
var Put = function (uri) {
    request = new Request(uri);

    this.header = function (key, value) {
        request.addHeader(key, value);
        return this;
    };

    this.accept = function (accpet) {
        request.accept(accpet);
        return this;
    };

    this.contentType = function (content) {
        request.contentType(content);
        return this;
    };

    this.path = function (path) {
        request.addPathParam(path);
        return this;
    };

    this.query = function (key, param) {
        request.addQueryParam(key, param);
        return this;
    };
    this.send = function (value) {
        request.body(value);
        return this;
    };

    this.exec = function (callback) {
        var req = request.buildRequest();
        var agent = Superagent.del(req.url);
        Object.keys(req.header).forEach(function (key) {
            agent.set(key, req.header[key]);
        });
        agent.send(req.body);
        agent.end(callback);
    };
};

module.exports = Put;

