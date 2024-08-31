using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class WalletManager : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI walletAddressText;
    [SerializeField] private NetworkId playerNetwork;

    public void SetPlayerAddress(string address)
    {
        playerNetwork.walletAddress = address;
        string formattedAddress = playerNetwork.walletAddress.Substring(0, 6) + "..." + playerNetwork.walletAddress.Substring(playerNetwork.walletAddress.Length - 4);
        walletAddressText.text = formattedAddress;
    }
}
