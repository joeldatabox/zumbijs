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

     if (!method || !(method instanceof Get || method instanceof Post || method instanceof Delete || method instanceof Delete)) {
     throw new Error('Warning, method is necessary [GET, POST, PUT, DELETE]');
     }*/
    console.log('request ->',req.headers);
    new Get('localhost:5001/pontos')
        .headers(req.headers)
        .exec(function (err, _res) {
    //    console.log(_res.res.headers);
        //fromTo(_res.res.headers, res);
        res.send(_res.res.body);
        res.end();
    });
};
module.exports = Proxy;


var fromTo = function (from, to) {
    var json = {};
    Object.keys(from).forEach(function (key) {
        to.header(key, from[key]);
    });

};