var ValidationErrors = {
    BADREQUEST: '400',
    UNAUTHORIZED: '401',
    FORBIDDEN: '403',
    NOTFOUND: '404',
    CONFLICT: '409'
};


function Exception(error) {
    var httpStatus = 500;
    var fieldError;
    var messageError;
    //console.log(JSON.stringify(error));
    if (error.name == 'CastError') {
        httpStatus = 400;
        fieldError = error.path;
        messageError = ({message: 'error cast \'' + error.value+'\'', campo:fieldError});
    } else {

        for (var propertyError in error.errors) {

            //take field error
            fieldError = error.errors[propertyError].path;
            var status = (error.errors[propertyError].message.substr(1, 3));

            switch (status) {
                case ValidationErrors.BADREQUEST:
                    messageError = ({message: error.errors[propertyError].message, campo: fieldError});
                    httpStatus = 400;
                    break;
                case ValidationErrors.CONFLICT:
                    messageError = ({message: error.errors[propertyError].message, campo: fieldError});
                    httpStatus = 409;
                    break;
                default:
                    if (error.errors[propertyError].message) {
                        httpStatus = 400;
                        messageError = ({error: error.errors[propertyError].message});
                    } else {
                        console.log(error.errors[propertyError].message);
                        httpStatus = 500;
                        messageError = ({error: 'Internal server error'});
                    }
            }
            break;
        }
    }

    this.getHttpStatus = function () {
        return httpStatus;
    }

    this.getErrors = function () {
        return messageError;
    }

};
module.exports = Exception;