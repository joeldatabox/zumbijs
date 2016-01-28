var Superagent = require('superagent');
var Request = require('../request');
var Post = function (uri) {
    request = new Request(uri);

    this.header = function (key, value) {
        request.addHeader(key, value);
        return this;
    };

    this.headers = function (headers) {
        request.addAllHeaders(headers);
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
        var agent = Superagent.post(req.url);
        Object.keys(req.header).forEach(function (key) {
            //previne erros
            if (key != 'content-length' && key != 'host') {
                agent.set(key, req.header[key]);
            }
        });
        if (req.body) {
            agent.send(req.body);
        }
        if (callback) {
            agent.end(callback);
        } else {
            agent.end();
        }
    };

    this.express = function (req, res) {
        this.headers(req.headers);
        this.send(req.body);
        //exec request
        this.exec(function (err, _res) {
            if (err) {
                if (err.code == 'ECONNREFUSED' || err.errno == 'ECONNREFUSED') {
                    res.statusCode = 503;
                    res.send({error:{message:'error on request service'}}).end();
                } else {
                    res.status(err.status)
                    if (err.response.body)
                        res.send(err.response.body).end();
                    else
                        res.end();
                }
            } else {
                res.body = _res.res.body;
                Object.keys(_res.res.headers).forEach(function (key) {
                    if (key == 'location') {
                        var obj = _res.header.location;
                        setLocation(req, res, obj.split('').reverse().join('').substring(0,24).split('').reverse().join(''));
                    } else {
                        res.set(key, _res.res.headers[key]);
                    }
                });
                res.statusCode = _res.res.statusCode;
                res.end();
            }
        });
    }
};

module.exports = Post;


/**
 * Add Location of the resources to the header of request
 * @param req ->request
 * @param res ->response
 * @param model ->model
 */
var setLocation = function (req, res, model) {
    var originalUrl = req.originalUrl;
    if(originalUrl.charAt(originalUrl.length -1) != '/'){
        originalUrl +='/';
    }
    var location =
        res.location(req.protocol + "://" + req.get('host') + originalUrl + model);
};