var Router = function (path, router) {

    var callbacks = new Array;
    route = router.route(path);

    /**
     * Add an callback in the Router
     * @param -> listen for method get
     */
    this.get = function (callback) {
        callbacks.push({'method': 'get'});
        route.get(prepareArguments(arguments));
        return this;
    };

    /**
     * Add an callback in the Router
     * @param -> listen for method post
     */
    this.post = function (callback) {
        callbacks.push({'method': 'post'});
        route.post(prepareArguments(arguments));
        return this;
    };

    /**
     * Add an callback in the Router
     * @param -> listen for method put
     */
    this.put = function (callback) {
        callbacks.push({'method': 'put'});
        route.put(prepareArguments(arguments));
        return this;
    };

    /**
     * Add an callback in the Router
     * @param -> listen for method delete
     */
    this.delete = function (callback) {
        callbacks.push({'method': 'delete'});
        route.delete(prepareArguments(arguments));
        return this;
    };

    this.routes = function () {
        return {'path': path, 'callbacks': callbacks}
    };

    /**
     * Return an instance of Route of express
     */
    this.getRouter = function () {
        return router;
    }
};

module.exports = Router;

/**
 * Prepare  n arguments recepted for parameter
 * @param _arguments -> list of arguments
 */
var prepareArguments = function (_arguments) {
    var result = new Array();
    for (var i = 0; i < _arguments.length; i++) {
        if (_arguments[i] instanceof Array) {
            var other =prepareArguments(_arguments[i]);
            if(result.length == 0){
                result = other;
            }else{
                other.forEach(function(item){
                    result.push(item);
                });
            }
        } else {
            result.push(_arguments[i]);
        }
    }
    return result;
};