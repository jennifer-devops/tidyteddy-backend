//Create response class to sending messages for testing purpose.
class Response{
    constructor(statusCode, httpStatus, message, data){
        this.timeStamp = new Date().toLocaleDateString();
        this.statusCode = statusCode;
        this.httpStatus = httpStatus;
        this.message = message;
        this.data = data;
    }
}

module.exports = Response;