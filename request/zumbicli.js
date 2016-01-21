var Superagent = require('superagent');
var Get = require('./method/get');
var Post = require('./method/post');
var Put = require('./method/put');
var Delete = require('./method/delete');
var Crud = require('./method/crud');
var ZumbiCli = function () {

    this.STATUS_CODE = {
        OK: 200,
        CREATE: 201,
        ACCEPTED: 202,
        BADREQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOTFOUND: 404,
        CONFLICT: 409
    };

    this.get = function (uri) {
        return new Get(uri);
    };
    this.post = function (uri) {
        return new Post(uri);
    };
    this.put = function (uri) {
        return new Put(uri);
    };
    this.delete = function (uri) {
        return new Delete(uri);
    };

    this.createCrudConsumer = function (endPoint) {
        return new Crud(endPoint);
    }
};

module.exports = ZumbiCli;