var Get = require('./method/get');
var Post = require('./method/post');
var Put = require('./method/put');
var Delete = require('./method/delete');

var Proxy = function (req, res, method) {

    /*if (!req) {
        throw new Error('Warning, request is necessary !');
    }

    if (!res) {
        throw new Error('Warning, response is necessary !');
    }

    if (!method || !(method instanceof Get || method instanceof Post || method instanceof Put || method instanceof Delete)) {
        throw new Error('Warning, method is necessary [GET, POST, PUT, DELETE]');
    }*/
    new Get('localhost:5000/pontos');
    console.log(req.headers);
};
module.exports = Proxy;