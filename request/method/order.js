var Order = function (value, parameters) {
    var params = new Array;
    this.ORDERBY = {
        ASC: 'orderByAsc',
        DESC: 'orderByDesc'
    };

    if (value != this.ORDERBY.ASC && value != this.ORDERBY.DESC)throw new Error('Warning. Parameter is necessary \'orderByAsc\' or \'orderByDesc\'. Please verify!');

    if (parameters) this.add(parameters);

    this.add = function (parameters) {
        if (parameters) {
            if (parameters instanceof Array) {
                params = params.concat(parameters);
            } else if (parameters instanceof String) {
                if (parameters.includes('|')) {
                    params = params.concat(parameters.split('|'));
                } else if (parameters.includes(' ')) {
                    params = params.concat(parameters.split(' '));
                } else {
                    params.push(parameters);
                }
            } else {
                throw new Error('Warning. The required parameters must be instance of the Array or String. If parameters instance of String, separate it with \'|\' or \' \'');
            }
        }
    };

    this.orders = function () {
        return {
            by: value,
            params: params.join('|')
        };
    }
};
module.exports = Order;