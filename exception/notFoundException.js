function NotFoundException(title, message) {
    var titleException = 'Resources is not found';
    var messageError = 'Not found';
    var httpStatus = 404;

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