namespace JagCodeHQ.Models
{
    public class Wallet
    {
        public string Address { get; set; }
        public string WalletType { get; set; }
        public string Chain { get; set; }
        public decimal Balance { get; set; }
        public string Currency { get; set; }
        public string Name { get; set; }
        public long LastSyncedTimestamp { get; set; }
        public bool IsConnected { get; set; }
    }
}