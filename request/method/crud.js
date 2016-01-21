var Order = require('./order');
var Get = require('./get');
var Post = require('./post');
var Put = require('./put');
var Delete = require('./delete');

var Crud = function (endPoint) {

    this.findById = function (id, callback) {
        new Get(endPoint).path(id).exec(callback);
    };
    this.save = function (value, callback) {
        new Post(endPoint).send(value).exec(callback);
    };
    this.update = function (value, callback) {
        new Put(endPoint).send(value).exec(callback);
    };
    this.find = function (skip, limit, order, filter, callback) {
        var get = new Get(endPoint);
        if (order && !(order instanceof Order)) throw new Error('Warning. The parameter \'order\' must be instance of \'Order\'');
        if (skip != null) get.query('skipe', skip);
        if (limit != null)get.query('limit', limit);
        if (order != null) {
            var ord = order.orders();
            get.query(ord.by, ord.params);
        }
        Object.keys(filter).forEach(function (key) {
            get.query(key, filter[key]);
        });
        get.exec(callback);
    };
    this.delete = function (id, callback) {
        new Delete(endPoint)
            .path(id)
            .exec(callback)
    }
};
module.exports = Crud;