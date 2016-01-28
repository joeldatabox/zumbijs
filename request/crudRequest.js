var Post = require('./method/post');
var Get = require('./method/get');
var Put = require('./method/put');
var Delete = require('./method/delete');
var agent = require('superagent');
/**
 * Starts a simple service which consumes another Microservice
 * @param host -> example 'localhost:8080'
 * @param path -> endPoint
 * @param zumbi -> instance of Zumbiservice
 */
var Crud = function (zumbi, host, path) {


    path.substring(0, 1) != '/' ? path = '/' + path : path = path;

    /**
     * Add endpoint whit method post
     * @param _path
     */
    this.post = function (_path) {
        zumbi
            //add endpoit post
            .post(_path, function (req, res) {
                new Post(prepareEndPoint(host, req.originalUrl)).express(req, res);
            });
        return this;
    };

    /**
     * Add endpoint whit method get
     * @param _path
     * @param field -> for endPoint whith pathparam
     */
    this.get = function (_path, field) {
        zumbi//add endpoit get
            .get(prepareEndPoint(_path, field), function (req, res) {
                new Get(prepareEndPoint(host, req.originalUrl)).express(req, res);
            });
        return this;
    };

    /**
     * Add endpoint whit method put
     * @param _path
     */
    this.put = function (_path) {
        zumbi//add endpoit put
            .put(_path, function (req, res) {
                new Put(prepareEndPoint(host, req.originalUrl)).express(req, res);
            });
        return this;
    };

    /**
     * Add endpoint whit method delete
     * @param _path
     * @param field -> for endPoint whith pathparam
     */
    this.delete = function (_path, field) {
        zumbi//add endpoit post
            .delete(prepareEndPoint(_path, field), function (req, res) {
                new Delete(prepareEndPoint(host, req.originalUrl)).express(req, res);
            });
        return this;
    };

    /**
     * Criate a simple crud, implementing all methods
     */
    this.createCrud = function () {
        this.post(path)
            .get(path)
            .get(path, ':id')
            .get(path, 'count')
            .put(path)
            .delete(path, ':id')
    };
};

module.exports = Crud;

var prepareEndPoint = function (singleEndPoint, concat) {
    if (singleEndPoint.charAt(singleEndPoint.length - 1) != '/') {
        singleEndPoint += '/';
    }
    if (concat == null) {
        return singleEndPoint;
    }
    if (concat.charAt(0) == '/') {
        concat = concat.substring(1, concat.length);
    }
    return singleEndPoint += concat;
};