function NotFoundException(title, message) {
    var titleException = 'Resources is not found';
    var messageError = 'Not found';
    var httpStatus = 404;

    if (title && title.name == 'CastError') {
        httpStatus = 204;
        //fieldError = error.path;
        //messageError = ({message: 'error cast \'' + error.value+'\'', campo:fieldError});
    }

    if (title) {
        titleException = title;
    }
    if (message) {
        messageException = message;
    }
    this.getTitle = function () {
        return titleException;
    };
    this.getErrors = function () {
        return messageError;
    };
    this.getHttpStatus = function () {
        return httpStatus;
    };
};
module.exports = NotFoundException;