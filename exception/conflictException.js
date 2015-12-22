function NotFoundException(title, message) {
    var titleException = 'Conflict';
    var messageError = 'Conflict';
    var httpStatus = 409;

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