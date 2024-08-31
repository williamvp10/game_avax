using System;
using System.Collections;
using UnityEngine;
using WebSocketSharp;

[CreateAssetMenu(fileName = "NetworkId", menuName = "Network/PlayerIds")]
public class NetworkId : ScriptableObject
{
    public string httpUrl;
    public string webSocketUrl;
    public string socketId;
    public string roomId;
    public WebSocket webSocket;
    public string walletAddress;
}
