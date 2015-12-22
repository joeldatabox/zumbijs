function BadRequestException(title, message) {
    var titleException = 'BadRequest';
    var messageError = 'BadRequest';
    var httpStatus = 400;

    if(title){
        titleException = title;
    }
    if(message){
        messageError = message;
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
module.exports = BadRequestException;