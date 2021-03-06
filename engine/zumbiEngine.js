var NotFoundException = require('./../exception/notFoundException');
var InternalErrorException = require('./../exception/internalErrorException');
var BadRequestException = require('./../exception/badRequestException');
var ConflictException = require('./../exception/conflictException');
var Exception = require('./../exception/exception');
var validator = require('validator');
var extend = require('util')._extend;

var EngineZumbi = function (request, response, model) {
    var res = response;
    var req = request;
    /**
     * Processes necessary response related to the search event of an appeal by id
     * @param key -> key for return to json
     */
    this.dispatchFindById = function (key) {
        model.findById(req.params.id, function (error, value) {
            if (error) {
                processExceptions(new NotFoundException(), res);
            } else if (value) {
                dispatcher(200, createJson(key, toObject(value)), res);
            } else {
                dispatcher(404, null, res);
            }
        });
    };
    /**
     * Processes necessary response related to search for feature event
     * @param key -> key for return to json
     */
    this.dispatchFind = function (key) {
        this.dispatchFindByField(undefined, key);
    };

    /**
     * Processes necessary response related to search for feature event filtering a field
     * @param fieldFilter -> field to filter
     * @param key -> key for return to json
     * @param callback -> callback
     */
    this.dispatchFindByField = function (fieldFilter, key, callback) {
        var parameter = {};
        fieldFilter ? parameter = extend(fieldFilter, req.query) : parameter = req.query;
        filterEngine(model.find(), validate(parameter), function (query) {
            query.exec(function (error, values) {
                if (error) {
                    processExceptions(new NotFoundException(error), res);
                } else if (values) {
                    if (callback) {
                        callback(values, function (_values) {
                            values = _values;
                            if (values.length > 0) {
                                //content registers
                                dispatcher(200, createJson(key, toObject(values)), res);
                            } else {
                                //nocontent registers
                                dispatcher(204, null, res);
                            }
                        });
                    } else {
                        if (values.length > 0) {
                            //content registers
                            dispatcher(200, createJson(key, toObject(values)), res);
                        } else {
                            //nocontent registers
                            dispatcher(204, null, res);
                        }
                    }
                } else {
                    dispatcher(204, null, res);
                }
            });
        });
    };
    /**
     * Save a item in database
     */
    this.dispatchSave = function () {
        if (Object.keys(req.body).length === 0) {
            processExceptions(new BadRequestException(), res);
        } else {
            //deleting the field _id for avoid inconsistency error
            delete req.body._id;
            model = new model(validate(req.body));
            model.save(function (error, valueSaved) {
                if (error) {
                    processExceptions(new Exception(error), res);
                } else {
                    //set location no header do response
                    setLocation(req, res, valueSaved);
                    dispatcher(201, null, res);
                }
            });
        }
    };

    /**
     * Save necessary changes in the database and dispatch request
     */
    this.dispatchUpdate = function () {
        var id = req.body._id;
        //console.log(req.body);
        delete req.body._id;
        model.findById(id, function (error, value) {
            if (error) {
                processExceptions(new NotFoundException(), res);
            } else if (value) {
                model.findByIdAndUpdate(id, validate(req.body), {runValidators: true}, function (error, value) {
                    if (error) {
                        processExceptions(new Exception(error), res);
                    } else if (value) {
                        /*console.log(value);*/
                        setLocation(req, res, value);
                        dispatcher(200, null, res);
                    } else {
                        dispatcher(404, null, res);
                    }
                });
            } else {
                dispatcher(404, null, res);
            }
        });
    };
    /**
     * Remove resources searching by id
     */
    this.dispatchDeleteById = function () {
        model.findById(req.params.id, function (error, value) {
            if (error) {
                if (error.name == 'CastError' && error.path == '_id') {
                    processExceptions(new NotFoundException(), res);
                } else {
                    processExceptions(new Exception(error), res);
                }
            } else if (value) {
                value.remove(function (error) {
                    if (error) {
                        processExceptions(new Exception(error), res);
                    } else {
                        dispatcher(200, null, res);
                    }
                });
            } else {
                dispatcher(404, null, res);
            }
        });
    };

    /**
     * Processes necessary response related to event count
     */
    this.dispatchCount = function (filters) {
        var parameters = {}
        filters ? parameters = extend(filters, req.query) : parameters = req.query;
        filterEngine(model.count(), validate(parameters), function (query) {
            query.exec(function (error, total) {
                if (error) {
                    processExceptions(new InternalErrorException(), res);
                } else {
                    res.status(200).send(JSON.stringify(total)).end();
                }
            });
        });
    };

    /**
     * Http request processing filters
     * @param filters -> parameters of request
     * @param callbakc -> notifications
     */
    this.filterEngine = function (filter, callback) {
        var parameter;
        filter ? parameter = extend(filter, req.query) : parameter = req.query;
        filterEngine(model.find(), validate(parameter), callback);
    };

    /**
     * Dispacher the response
     * @param statusHttp -> status
     * @param body -> content for dispath
     * @param res -> response for dispath
     */
    this.dispatch = function (statusHttp, body) {
        dispatcher(statusHttp, body, res);
    };
    /**
     * Processes exceptions for requests
     * @param error -> exception occurred
     */
    this.exception = function (error) {
        processExceptions(error, res);
    }
};
module.exports = EngineZumbi;

/**
 * Processes exceptions for requests
 * @param error -> exception occurred
 * @param response -> response of client
 */
var processExceptions = function (error, response) {
    //return message error
    response
        .status(error.getHttpStatus())
        .send({'error': error.getErrors()})
        .end();
};


/**
 * Validate json Objects from request, avoiding sql injections and others
 * @param model -> model for validate
 */
var validate = function (model) {
    Object.keys(model).forEach(function (key) {
        if (model[key] instanceof Array) {
            model[key].forEach(function (item) {
                item = validate(item);
            });
        } else if (model[key] instanceof Object) {
            validate(model[key]);
        } else {
            if ((model[key] + '').length > 0) {
                if (!isObjectID(model[key])) {
                    model[key] = validator.trim(validator.escape(model[key]));
                }
            } else {
                delete model[key];
            }
        }
    });
    return model;
};

/**
 * Http request processing filters
 * @param query -> query of mogoose
 * @param parameters -> parameters of request
 * @param callbakc -> notifications
 */
var filterEngine = function (query, parameters, callback) {
    var skip, limit, orderByAsc, orderByDesc, fields, between, select;
    if (parameters.skip) {
        query.skip(Number(parameters.skip));
        delete parameters.skip;
    } else {
        query.skip(0);
    }

    if (parameters.limit) {
        query.limit(Number(parameters.limit));
        delete parameters.limit;
    } else {
        query.limit(1000);
    }

    if (parameters.orderByAsc) {
        parameters.orderByAsc.split('|').forEach(function (value) {
            query.sort(createJson(value, 1));
        });
        delete parameters.orderByAsc;
    }

    if (parameters.orderByDesc) {
        parameters.orderByDesc.split('|').forEach(function (value) {
            query.sort(createJson(value, -1));
        });
        delete parameters.orderByDesc;
    }

    if (parameters.between && parameters.gte && parameters.lt) {
        query.where(parameters.between, {'$gte': parameters.gte, '$lt': parameters.lt});
        delete parameters.between;
        delete parameters.gte;
        delete parameters.lt;
    }

    if (parameters.select) {
        parameters.select.split('|').forEach(function (value) {
            query.select(createJson(value, 1));
        });
        delete parameters.select;
    }

//percorrendo todos os campos passado por paramentro
    Object.keys(parameters).forEach(function (key) {
        query.where(key, parameters[key]);
    });
    callback(query);
};
/**
 * Create a json
 * @param key -> key of json
 * @param values -> value present in the json
 */
var createJson = function (key, values) {

    //if the key is empty, return single value
    if (!key)return values;
    var json = {};
    json[key] = values;
    return json;
};

/**
 * Add Location of the resources to the header of request
 * @param req ->request
 * @param res ->response
 * @param model ->model
 */
var setLocation = function (req, res, model) {
    var originalUrl = req.originalUrl;
    if (originalUrl.charAt(originalUrl.length - 1) != '/') {
        originalUrl += '/';
    }
    var location =
        res.location(req.protocol + "://" + req.get('host') + originalUrl + model._id);
};

/**
 * Dispacher the response
 * @param statusHttp -> status
 * @param body -> content for dispath
 * @param res -> response for dispath
 */
var dispatcher = function (statusHttp, body, res) {
    res.status(statusHttp);
    if (body) {
        res.send(body).end();
    } else {
        res.end();
    }
};

/**
 * Checks if a value is a valid bson ObjectId
 *
 * @method
 * @return {boolean} return true if the value is a valid bson ObjectId, return false otherwise.
 */
isObjectID = function isValid(id) {
    if (id == null) return false;
    if (typeof id == 'number')
        return true;
    if (typeof id == 'string') {
        return id.length == 12 || (id.length == 24 && new RegExp("^[0-9a-fA-F]{24}$").test(id));
    }
    return false;
};

/**
 * Checks if model contains method[toObject] for transformation in json object
 * @param values -> Array of models or single model the mongoose
 */
function toObject(values) {
    if (values instanceof Array) {
        return values.map(function (item) {
            if (typeof(item.toObject) === typeof (Function)) {
                return item.toObject();
            }
            return item;
        });
    } else {
        if (typeof(values.toObject) === typeof (Function)) {
            return values.toObject();
        }
        return values;
    }
}