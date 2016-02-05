var express;
var bodyParser = require('body-parser');
var ZumbiEngine = require('./engine/zumbiEngine');
var ZumbiModel = require('./zumbiModel');
var Post = require('./request/method/post');
var Router;
var METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete'
};

var ZumbiServer = function (zumbiModel) {
    express = require('express');
    var port;
    var endPoints = new Array;
    var useExpress = new Array;
    var express;


    if (zumbiModel != null)
        this.addCrud(zumbiModel);

    Router = express.Router();
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
        /*var router = express.Router();
         if (arguments.length > 2) {
         //começamos no indice 1 pois não se pode pegar o parametro endPoint e sim pegar todos os callbacks
         for (i = 1; i < arguments.length; i++) {
         router.route(endPoint).get(arguments[i]);
         }
         }else{
         router.route(endPoint).get(callback);
         }*/
        endPoints.push(proccessMethods('get', arguments));
        return this;
    };
    /**
     * Add endpoint with POST method
     * @param endPoint -> endPoint for method POST
     * @param endPoint -> route for endPoint
     */
    this.post = function (endPoint, router) {
        /*endPoints.push({method: METHOD.POST, endPoint: endPoint, router: router});*/
        endPoints.push(proccessMethods('post', arguments));
        return this;
    };
    /**
     * Add endpoint with put method
     * @param endPoint -> endPoint for method PUT
     * @param endPoint -> route for endPoint
     */
    this.put = function (endPoint, router) {
        /*endPoints.push({method: METHOD.PUT, endPoint: endPoint, router: router});*/
        endPoints.push(proccessMethods('put', arguments));
        return this;
    };
    /**
     * Add endpoint with delete method
     * @param endPoint -> endPoint for method PUT
     * @param endPoint -> route for endPoint
     */
    this.delete = function (endPoint, router) {

        /*endPoints.push({method: METHOD.DELETE, endPoint: endPoint, router: router});*/
        endPoints.push(proccessMethods('delete', arguments));
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
        processEndPoints(prefix);
        /*if(autoRegister){
         new Post(autoRegister)
         .path('/registerMicroservices')
         .send(endPoints)
         .exec();
         }*/
    };

    var processEndPoints = function (prefix) {
        endPoints.forEach(function (endPoint) {
            express.use(prefix, endPoint);
            /*switch (endPoint['method']) {
                case METHOD.GET:
                    express.get(prepareEndPoint(prefix, endPoint['endPoint']), endPoint['router']);
                    break;
                case METHOD.POST:
                    express.post(prepareEndPoint(prefix, endPoint['endPoint']), endPoint['router']);
                    break;
                case METHOD.PUT:
                    express.put(prepareEndPoint(prefix, endPoint['endPoint']), endPoint['router']);
                    break;
                case METHOD.DELETE:
                    express.delete(prepareEndPoint(prefix, endPoint['endPoint']), endPoint['router']);
                    break;
                default:
                    throw new Error('Erro add endpoint -> ', endPoint);
                    break;
            }
            console.log('add [method "%s" endPoint "%s"]', endPoint['method'], prepareEndPoint(prefix, endPoint['endPoint']));*/
        });
        express.options('/', function (req, res) {
            res.send({'Zumbi-Methods': endPoints});
        });
    }
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

    if (concat.charAt(0) != '/') {
        concat = '/' + concat;
    }
    if (concat.charAt(concat.length - 1) != '/') {
        concat += '/';
    }
    return (singleEndPoint + concat).replace('//', '/');
};

var proccessMethods = function (method, parameters) {
    var route = Router.route(parameters[0]);
    if (parameters.length > 2) {
        //começamos no indice 1 pois não se pode pegar o parametro endPoint e sim pegar todos os callbacks
        for (i = 1; i < parameters.length; i++) {
            route[method](arguments[i]);
        }
    } else {
        route[method](parameters[1]);
    }
    return route;
};