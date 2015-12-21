var NotFoundException = require('../ponto-service/exception/notFoundException');
var InternalErrorException = require('../ponto-service/exception/internalErrorException');
var BadRequestException = require('../ponto-service/exception/badRequestException');
var Exception = require('../ponto-service/exception/exception');
var validator = require('validator');
var extend = require('util')._extend;

var Zumbi = function (request, response, model) {
    var res = response;
    var req = request;
    /**
     * Trata resposta necessaria relacionada ao evento de busca de um recurso pelo ID
     * @param key -> chave para retorno do json
     * @param modelConstructor -> callback para construir o model
     */
    this.dispatchFindById = function (key) {
        model.findById(req.params.id, function (error, value) {
            if (error) {
                processExceptions(new NotFoundException(), res);
            } else if (value) {
                dispatcher(200, createJson(key, value), res);
            } else {
                dispatcher(404, null, res);
            }
        });
    };
    /**
     * Trata resposta necessaria relacionada ao evento de busca de um recurso
     * @param key -> chave para retorno do json
     * @param modelConstructor -> callback para construir o model
     */
    this.dispatchFind = function (key) {
        this.dispatchFindByField(undefined, key);
    };

    /**
     * Trata resposta necessaria relacionada ao envento de busca de um recurso filtrando um campo
     * @param fieldFilter -> campo a ser filtrado
     * @param key -> chave para retorno no json
     */
    this.dispatchFindByField = function (fieldFilter, key) {
        var parameter = {};
        fieldFilter ? parameter = extend(fieldFilter, req.query) : parameter = req.query;
        filterEngine(model.find(), validate(parameter), function (query) {
            query.exec(function (error, values) {
                if (error) {
                    processExceptions(new NotFoundException(), res);
                } else if (values) {
                    dispatcher(200, createJson(key, values), res);
                } else {
                    dispatcher(404, null, res);
                }
            });
        });
    };
    /**
     * Sava um intem no banco e dispacha o mesmo
     * @param modelConstructor -> function que constroem um objeto do tipo esperado
     */
    this.dispatchSave = function () {
        if (Object.keys(req.body).length === 0) {
            processExceptions(new BadRequestException(), res);
        } else {
            //deletando o campo _id para evitar erro de inconsistencia
            delete req.body._id;
            model = new model(validate(req.body));
            model.save(function (error, valueSaved) {
                if (error) {
                    processExceptions(new Exception(error), res);
                } else {
                    //setando location no header do response
                    setLocation(req, res, valueSaved);
                    dispatcher(201, null, res);
                }
            });
        }
    };

    /**
     * Salva alteraçao necessaria no banco e dispacha a requicao
     */
    this.dispatchUpdate = function () {
        var id = req.body._id;
        delete req.body._id;
        model.findByIdAndUpdate(id, validate(req.body), {runValidators: true}, function (error, value) {
            if (error) {
                processExceptions(new Exception(error), res);
            } else if (value) {
                setLocation(req, res, value);
                dispatcher(200, null, res);
            } else {
                dispatcher(404, null, res);
            }
        });
    };

    this.dispatchDeleteById = function () {
        model.findById(req.params.id, function (error, value) {
            if (error) {
                processExceptions(new Exception(error), res);
            } else if (value) {
                value.remove(function (error) {
                    if (error) {
                        processExceptions(new Exception(error));
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
     * trata resposta necessaria relacionada ao envento de countar numero de documentos
     */
    this.dispatchCount = function () {
        filterEngine(model.count(), validate(req.query), function (query) {
            query.exec(function (error, total) {
                if (error) {
                    processExceptions(new InternalErrorException(), res);
                } else {
                    res.status(200).send(JSON.stringify(total)).end();
                }
            });
        });
    };
};
module.exports = Zumbi;

/**
 * Processa exceptions para devolver devidos codigos de errors para a requisição
 * @param error -> exception ocorrida
 * @param response -> response do cliente
 */
var processExceptions = function (error, response) {
    //devolvendo a mensagem de erro pra requisição
    response
        .status(error.getHttpStatus())
        .send({'error': error.getErrors()})
        .end();
};


/**
 * Valida objetos vindo de requisição para evitar sql injections e coisas do tipo
 * @param model -> modelo a ser validado
 */
var validate = function (model) {
    Object.keys(model).forEach(function (key) {
        if (model[key] instanceof Array) {
            model[key].forEach(function (key) {
                return validate(key);
            });
        } else {
            model[key] = validator.trim(validator.escape(model[key]));
            if (model[key] == '') {
                //console.log('deletando..');
                //console.log(model[key]);
                delete model[key];
            }
        }
    });
    return model;
};

/**
 * Processa filtros adivindos de requisições http
 * @param query -> query do mogoose
 * @param parameters -> parametros advindo da requisição
 * @param callbakc -> notifica termino
 */
var filterEngine = function (query, parameters, callback) {
    var skip, limit, orderByAsc, orderByDesc, fields;

    //console.log(parameters['orderByAsc']);

    //filtrando conforme os parametros;
    if (parameters.skip) {
        query.skip(parameters.skip);
        delete parameters.skip;
    } else {
        query.skip(0);
    }

    if (parameters.limit) {
        query.limit(parameters.limit);
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

//percorrendo todos os campos passado por paramentro
    Object.keys(parameters).forEach(function (key) {
        query.where(key, parameters[key]);
    });
    callback(query);
};
/**
 * Cria um json lenvando em consideração a chave e valor passado por parametro
 * @param key -> chave do json
 * @param values -> valor presente no json
 */
var createJson = function (key, values) {
    //se key é vazio retornamos apenas values
    if (!key)return values;
    var json = {};
    json[key] = values;
    return json;
};

/**
 * Adiciona o location no cabeçalho da requisição
 * @param req ->request
 * @param res ->response
 * @param model ->model
 */
var setLocation = function (req, res, model) {
    res.location(req.protocol + "://" + req.get('host') + req.originalUrl + '/' + model._id);
};

/**
 * Dispacha o response
 * @param statusHttp -> status
 * @param body -> coteudo a ser despachado
 * @param res -> response para despacho
 */
var dispatcher = function (statusHttp, body, res) {
    res.status(statusHttp);
    if (body) {
        res.send(body).end();
    } else {
        res.end();
    }
};