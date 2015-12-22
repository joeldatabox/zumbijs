var bodyParser = require('body-parser');
var ZumbiEngine = require('./engine/zumbiCrud');
var ZumbiModel = require('./zumbiModel');
var METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete'
};

var ZumbiServer = function (_express, zumbiModel) {
    var port;
    var endPoints = new Array;
    var express;
    if (!_express) {
        throw new Error('Plese, express is required');
    } else {
        express = _express;
    }

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
    this.crudOfModel = function () {
        if (!zumbiModel || !zumbiModel instanceof ZumbiModel)throw new Error('Warning, zumbiModel is null.');
        this.post(zumbiModel.getEndPoint(), function (req, res) {
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchSave();
        });
        this.put(zumbiModel.getEndPoint(), function (req, res) {
            new ZumbiEngine(req, res, zumbiModel.getModel()).dispatchFind();
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
        zumbiModel.getSubEndPoints().forEach(function (subEndPoint) {

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
    this.get = function (endPoint, router) {
        endPoints.push({method: METHOD.GET, endPoint: endPoint, router: router});
        return this;
    };
    /**
     * Add endpoint with POST method
     * @param endPoint -> endPoint for method POST
     * @param endPoint -> route for endPoint
     */
    this.post = function (endPoint, router) {
        endPoints.push({method: METHOD.POST, endPoint: endPoint, router: router});
        return this;
    };
    /**
     * Add endpoint with put method
     * @param endPoint -> endPoint for method PUT
     * @param endPoint -> route for endPoint
     */
    this.put = function (endPoint, router) {
        endPoints.push({method: METHOD.PUT, endPoint: endPoint, router: router});
        return this;
    };
    /**
     * Add endpoint with delete method
     * @param endPoint -> endPoint for method PUT
     * @param endPoint -> route for endPoint
     */
    this.delete = function (endPoint, router) {
        endPoints.push({method: METHOD.DELETE, endPoint: endPoint, router: router});
        return this;
    };
    /**
     * Start Zumbi Server
     */
    this.startZumbiServer = function (callBackOnListen) {
        var server = express.listen(port, function () {
            console.log('Zumbi Server started on port ' + server.address().port);
            if (callBackOnListen)callBackOnListen();
        });
        express.use(bodyParser.json());
        express.use(bodyParser.urlencoded({
            extended: true
        }));
        processEndPoints();
    };

    var processEndPoints = function () {
        endPoints.forEach(function (endPoint) {
            switch (endPoint['method']) {
                case METHOD.GET:
                    express.get(endPoint['endPoint'], endPoint['router']);
                    break;
                case METHOD.POST:
                    express.post(endPoint['endPoint'], endPoint['router']);
                    break;
                case METHOD.PUT:
                    express.put(endPoint['endPoint'], endPoint['router']);
                    break;
                case METHOD.DELETE:
                    express.delete(endPoint['endPoint'], endPoint['router']);
                    break;
                default:
                    throw new Error('Erro add endpoint -> ', endPoint);
                    break;
            }
            console.log('add [method "%s" endPoint "%s"]', endPoint['method'], endPoint['endPoint']);
        });
    }
};

module.exports = ZumbiServer;
var prepareEndPoint = function (singleEndPoint, concat) {
    return ((singleEndPoint.charAt(singleEndPoint.length - 1)) != '/') ? endpoitCount = singleEndPoint + '/' + concat : endpoitCount = singleEndPoint + concat;
};