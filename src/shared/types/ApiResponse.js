class ApiResponse {
  items = [];
  message = "";
  error = null;
  status = 0;

  static success(items, message = "", status = 200) {
    const response = new ApiResponse();
    response.items = items;
    response.message = message;
    response.status = status;
    return response;
  }

  static error(message, error = null, status = 500) {
    const response = new ApiResponse();
    response.message = message;
    response.error = error;
    response.status = status;
    return response;
  }
}

module.exports = ApiResponse;
