var extend = require('util')._extend;
var MEDIA_TYPE = {
    XML: 'application/xml',
    JSON: 'application/json',
    TEXT: 'text/html'
};
var Request = function (URI) {
    var headers = {};
    var body = {};
    var url = URI;

    this.MEDIA_TYPE = MEDIA_TYPE;

    this.body = function (_body) {
        body = _body;
        return this;
    };

    this.addPathParam = function (parameter) {
        (parameter.substring(0, 1) === '/') ? url += parameter : url += '/' + parameter;
        return this;
    };

    this.addQueryParam = function (key, value) {
        if (url.includes('?')) {
            (url.substring(url.length - 1, url.length) === '?' ) ? url += key + '=' + value : url += '&' + key + '=' + value;
        } else {
            url += '?' + key + '=' + value;
        }
    };

    this.addHeader = function (key, value) {
        headers[key] = value;
    };

    this.addAllHeaders = function(json){
          headers = extend(headers, json);
    };

    this.accept = function (accept) {
        if (accept instanceof Array) {
            accept.forEach(function (key) {
                this.accept(accept)
            });
        }
        if (!headers['Accept']) {
            headers['Accept'] = accept;
        } else {
            headers['Accept'] += ', ' + accept;
        }
    };

    this.contentType = function (content) {
        if (!headers['Content-Type']) {
            headers['Content-Type'] = content;
        } else {
            headers['Content-Type'] += ', ' + content;
        }
    };

    this.buildRequest = function () {
        var json = {};
        if(Object.keys(body).length >0) json.body = body;
        json.url = url;
        json.header = headers;
        return json;
    };

};
module.exports = Request;