namespace JagCodeHQ.Models
{
    public class ServiceStatus
    {
        public string ServiceName { get; set; }
        public bool IsOnline { get; set; }
        public string LastChecked { get; set; }
        public string Message { get; set; }
    }
}