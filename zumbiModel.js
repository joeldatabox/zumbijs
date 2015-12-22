var zumbiModel = function (endPoint, model, resourcePlural, resourceSingular) {
    var subEndPoints = new Array;
    if (model == null)throw new Error('Warning, model can not be null!');
    /**
     * Return endPoint
     */
    this.getEndPoint = function () {
        return endPoint;
    };
    /**
     * Return model
     */
    this.getModel = function () {
        return model;
    };
    /**
     * Return resources plural
     */
    this.getResourcePlural = function () {
        return resourcePlural;
    };
    /**
     * Return resources singular
     */
    this.getResourceSingular = function () {
        return resourceSingular;
    };
    /**
     * Add endPoint for query by Model fields
     * @param subEndPoint
     */
    this.addGetSubEndPoint = function (subEndPoint) {
        subEndPoints.push(subEndPoint);
    };
    /**
     * Return subEndPoints for query
     */
    this.getSubEndPoints = function () {
        return subEndPoints
    };
};
module.exports = zumbiModel;