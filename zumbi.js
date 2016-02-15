var express = require('express');
var bodyParser = require('body-parser');
var ZumbiEngine = require('./engine/zumbiEngine');
var ZumbiModel = require('./zumbiModel');
var Post = require('./request/method/post');
var Router = require('./router/router');
var morgan = require('morgan');
var underscore = require('underscore');

var METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete'
};

var ZumbiServer = function (zumbiModel) {

    var port;
    var endPoints = new Array;
    var useExpress = new Array;
    var log;


    if (zumbiModel != null)
        this.addCrud(zumbiModel);

    /**
     * Enable ou disable the log to console
     * @param value -> a boolean
     */
    this.showLog = function (value) {
        log = value;
        return this;
    };
    /**
     * Set the port to be listened by the ZumbiServer
     * @param port -> port for listen
     */
    this.port = function (_port) {
        port = _port;
        return this;
    };
    /**
     * Sets the zombie model if it is not spent by the constructor
     * @param _zumbiModel -> zumbiModel
     */
    this.model = function (_zumbiModel) {
        zumbiModel = _zumbiModel;
    };
    this.addUsesExpress = function (use) {
        useExpress.push(use);
    };

    /**
     * Add crud of zumbiModel
     */
    this.addCrud = function (zumbiModel) {
        if (!zumbiModel || !zumbiModel instanceof ZumbiModel)throw new Error('Warning, zumbiModel is null.');
        this.post(zumbiModel.getEndPoint(), function (req, res) {
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchSave();
        });
        this.put(zumbiModel.getEndPoint(), function (req, res) {
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchUpdate();
        });

        this.get(prepareEndPoint(zumbiModel.getEndPoint(), 'count'), function (req, res) {
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchCount();
        });
        this.get(prepareEndPoint(zumbiModel.getEndPoint(), ':id'), function (req, res) {
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchFindById(zumbiModel.getResourceSingular());
        });
        this.get(zumbiModel.getEndPoint(), function (req, res) {
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchFind(zumbiModel.getResourcePlural());
        });
        this.delete(prepareEndPoint(zumbiModel.getEndPoint(), ':id'), function (req, res) {
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchDeleteById();
        });
        return this;
    };


    /**
     * Add endpoint with GET method
     * @param endPoint -> endPoint for method GET
     * @param endPoint -> path from model for query
     */
    this.addGetfindBySubEndPoint = function (endPoint, fieldFielter) {
        if (!endPoint.contains(':'))throw new Error('Warning, it is necessary to enter a endPoint with a parameter. Example "/people/name/:name" where the parameter ": name" is necessary');
        index = endPoint.indexOf(':');
        parameter = endPoint.substr(index, endPoint.length);
        json = {};
        this.get(endPoint, function (req, res) {
            json[fieldFielter] = req.params[parameter.replace(':')];
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchFindByField(json, zumbiModel.getResourcePlural());
        });
    };

    /**
     * Add endpoint with GET method
     * @param endPoint -> endPoint for method GET
     * @param endPoint -> route for endPoint
     */
    this.get = function (endPoint, callback) {
        var router = new Router(prepareEndPoint(endPoint), express.Router());
        var args = prepareArguments(arguments).slice(1, arguments.length);
        router.get(args);
        endPoints.push({
            method: METHOD.GET,
            endPoint: endPoint,
            routers: router,
            weigth: checkWeight(METHOD.GET, endPoint)
        });
        return this;
    };
    /**
     * Add endpoint with POST method
     * @param endPoint -> endPoint for method POST
     * @param endPoint -> route for endPoint
     */
    this.post = function (endPoint, callback) {
        var router = new Router(prepareEndPoint(endPoint), express.Router());
        var args = prepareArguments(arguments).slice(1, arguments.length);
        router.post(args);
        endPoints.push({
            method: METHOD.POST,
            endPoint: endPoint,
            routers: router,
            weigth: checkWeight(METHOD.POST, endPoint)
        });
        return this;
    };
    /**
     * Add endpoint with put method
     * @param endPoint -> endPoint for method PUT
     * @param endPoint -> route for endPoint
     */
    this.put = function (endPoint, callback) {
        var router = new Router(prepareEndPoint(endPoint), express.Router());
        var args = prepareArguments(arguments).slice(1, arguments.length);
        router.put(args);
        endPoints.push({
            method: METHOD.PUT,
            endPoint: endPoint,
            routers: router,
            weigth: checkWeight(METHOD.PUT, endPoint)
        });
        return this;
    };
    /**
     * Add endpoint with delete method
     * @param endPoint -> endPoint for method PUT
     * @param endPoint -> route for endPoint
     */
    this.delete = function (endPoint, callback) {
        var router = new Router(prepareEndPoint(endPoint), express.Router());
        var args = prepareArguments(arguments).slice(1, arguments.length);
        router.delete(args);
        endPoints.push({
            method: METHOD.DELETE,
            endPoint: endPoint,
            routers: router,
            weigth: checkWeight(METHOD.DELETE, endPoint)
        });
        return this;
    };
    /**
     * Start Zumbi Server
     * @param prefix -> prefix of all endpoints
     * @param callBackOnListen ->listen envents of express
     */
    this.startZumbiServer = function (prefix, callBackOnListen) {
        var app = express();
        var server = app.listen(port, function () {
            console.log('Zumbi Server started on port ' + server.address().port);
            if (callBackOnListen)callBackOnListen();
        });
        useExpress.forEach(function (uses) {
            app.use(uses);
        });
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }));
        if (log) {
            app.use(morgan('dev'));
        }
        endPoints = underscore.sortBy(endPoints, 'weigth');
        for (i = 0; i < endPoints.length; i++) {
            app.use(prepareEndPoint(prefix), endPoints[i].routers.getRouter());
            console.log('add method [%s->"%s"]', endPoints[i]['method'], prepareEndPoint(prefix, endPoints[i]['endPoint']));
        }

        app.options('/', function (req, res) {
            res.send({'Zumbi-Methods': endPoints});
        });
    };


};

module.exports = ZumbiServer;
var prepareEndPoint = function (singleEndPoint, concat) {
    if (singleEndPoint == null)singleEndPoint = '';
    if (singleEndPoint.charAt(0) != '/') {
        singleEndPoint = '/' + singleEndPoint;
    }
    if (singleEndPoint.charAt(singleEndPoint.length - 1) != '/') {
        singleEndPoint += '/';
    }

    if (concat == null)concat = '';
    if (concat.charAt(0) != '/') {
        concat = '/' + concat;
    }
    if (concat.charAt(concat.length - 1) != '/') {
        concat += '/';
    }
    var result = (singleEndPoint + concat).replace('//', '/');
    return result.substring(0, result.length - 1);
};

/**
 * Prepare  n arguments recepted for parameter
 * @param _arguments -> list of arguments
 */
var prepareArguments = function (_arguments) {
    var result = new Array();
    for (var i = 0; i < _arguments.length; i++) {
        result.push(_arguments[i]);
    }
    return result;
};

var checkWeight = function (method, endpoits) {
    var index = 0;
    var weight = 0;
    var arr = endpoits.split('/');
    for (var i = 0; i < arr.length; i++) {
        if(endpoits.includes(':')){
            var aux = endpoits.split(':').length;
            weight += (i ^ aux)+aux + i
        }else{
            weight +=i+1;
        }
    }
    return weight;
};