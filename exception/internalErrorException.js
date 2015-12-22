function NotFoundException(title, message) {
    var titleException = 'Error';
    var messageError = 'Internal Error';
    var httpStatus = 500;

    if(title){
        titleException = title;
    }
    if(message){
        messageException = message;
    }
    this.getTitle = function(){
        return titleException;
    };
    this.getErrors = function(){
        return messageError;
    };
    this.getHttpStatus = function(){
        return httpStatus;
    };
};
module.exports = NotFoundException;