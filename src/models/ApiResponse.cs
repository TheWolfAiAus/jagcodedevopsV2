namespace JagCodeHQ.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public ErrorResponse Error { get; set; }

        public ApiResponse(bool success, T data, string message = null, ErrorResponse error = null)
        {
            Success = success;
            Data = data;
            Message = message;
            Error = error;
        }

        public static ApiResponse<T> SuccessResponse(T data, string message = "Operation successful")
        {
            return new ApiResponse<T>(true, data, message);
        }

        public static ApiResponse<T> ErrorResponse(string message = "Operation failed", string errorCode = null, int statusCode = 500)
        {
            return new ApiResponse<T>(false, default(T), message, new ErrorResponse(message, errorCode, statusCode));
        }
    }
}