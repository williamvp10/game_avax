using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro;

public class WalletManager : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI walletAddressText;
    [SerializeField] private NetworkId playerNetwork;

    [SerializeField] private GameObject walletInputCanvas;
    [SerializeField] private TMP_InputField walletInputField;

    public void SetPlayerAddress(string address)
    {
        playerNetwork.walletAddress = address;
        string formattedAddress = playerNetwork.walletAddress.Substring(0, 6) + "..." + playerNetwork.walletAddress.Substring(playerNetwork.walletAddress.Length - 4);
        walletAddressText.text = formattedAddress;
    }

    public void UpdatePlayerAddressFromInput()
    {
        string inputAddress = walletInputField.text; // Obtén el valor del input
        SetPlayerAddress(inputAddress);
    }

    public void ShowCanvas()
    {
        walletInputCanvas.SetActive(true);
    }

    public void HideCanvas()
    {
        UpdatePlayerAddressFromInput();
        walletInputCanvas.SetActive(false);
    }
}
