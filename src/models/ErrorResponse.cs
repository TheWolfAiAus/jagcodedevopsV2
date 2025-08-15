namespace JagCodeHQ.Models
{
    public class ErrorResponse
    {
        public string Message { get; set; }
        public string ErrorCode { get; set; }
        public int StatusCode { get; set; }

        public ErrorResponse(string message = "An error occurred", string errorCode = null, int statusCode = 500)
        {
            Message = message;
            ErrorCode = errorCode;
            StatusCode = statusCode;
        }
    }
}