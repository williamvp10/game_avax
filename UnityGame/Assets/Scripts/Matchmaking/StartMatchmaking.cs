using System;
using System.Collections;
using UnityEngine;
using TMPro;
using UnityEngine.Networking;
using WebSocketSharp;
using UnityEngine.SceneManagement;
using Newtonsoft.Json.Linq;
using System.Security.Cryptography;
using UnityEngine.UI;

[Serializable]
public class Position
{
    public float x;
    public float y;
}

[Serializable]
public class GameStartData
{
    public string roomId;
    //public Dictionary<string, Position> initialPositions;
}

[Serializable]
public class ServerMessage
{
    public string message;
    public GameStartData data;
}

[Serializable]
public class MatchmakingResponse
{
    public string message;
}

[Serializable]
public class SocketMessage
{
    public string type;
    public string socketId;
}

[Serializable]
public class PlayerData
{
    public string id;
    public int cups;
    public int level;
    public string socketId;
    public int skinId;
    public string walletAddress;

    public PlayerData(string id, int cups, int level, string socketId, int skinId, string walletAddress)
    {
        this.id = id;
        this.cups = cups;
        this.level = level;
        this.socketId = socketId;
        this.skinId = skinId;
        this.walletAddress = walletAddress;
    }
}

[Serializable]
public class SetUpGame
{
    public string type;
    public string roomId;
}

public class StartMatchmaking : MonoBehaviour
{

    [SerializeField] private TextMeshProUGUI serverResponse;
    [SerializeField] private NetworkId playerNetworkId;
    [SerializeField] private PlayerStats playerStats;

    [SerializeField] private Sprite newReadyButtonImg;
    [SerializeField] private Button readyButton;
    [SerializeField] private TextMeshProUGUI readyButtonText;

    //[SerializeField] private string matchmakingUrl = "https://localhost:3000/api/matchmaking/join";

    private WebSocket webSocket;
    private string roomId;
    private bool startMatch = false;

    private bool sendTransactionNotify = false;

    private void Start()
    {
        webSocket = new WebSocket(playerNetworkId.webSocketUrl);

        webSocket.OnMessage += (sender, e) =>
        {
            try
            {
                // Intentar deserializar como SocketMessage
                SocketMessage message = JsonUtility.FromJson<SocketMessage>(e.Data);

                if (message != null && message.socketId != null)
                    playerNetworkId.socketId = message.socketId;
                else
                {
                    //serverResponse.text = "Waiting";
                    ServerMessage serverMessage = JsonUtility.FromJson<ServerMessage>(e.Data);
                    if(serverMessage.message == "gameStartTransaction")
                    {
                        //serverResponse.text = "gameStartTransaction";
                        JObject parsedData = JObject.Parse(e.Data);
                        playerNetworkId.roomId = parsedData["data"]["roomId"].ToString();
                        //SendMessageToReactComponent(parsedData["data"]["web3RoomId"].ToString(), parsedData["data"]["betAmount"].ToString());
                    }

                    if (serverMessage.message == "gameStart")
                    {
                        playerNetworkId.roomId = serverMessage.data.roomId;
                        startMatch = true;
                    }
                }

            }
            catch (Exception ex)
            {
                Debug.LogWarning("SocketMessage deserialization failed. Trying MatchmakingResponse. Exception: " + ex.Message);
            }
        };

        webSocket.OnOpen += (sender, e) =>
        {
            Debug.Log("WebSocket connection opened.");
        };

        webSocket.OnClose += (sender, e) =>
        {
            Debug.Log("WebSocket connection closed.");
        };

        webSocket.OnError += (sender, e) =>
        {
            Debug.LogError("WebSocket error: " + e.Message);
        };

        webSocket.Connect();

        playerNetworkId.webSocket = webSocket;
    }

    private void Update()
    {
        if(startMatch)
            SceneManager.LoadScene("SampleScene");
    }

    public void SearchMatchmaking()
    {
        //StartCoroutine(SendMatchmakingRequest(inputID.text, int.Parse(inputCups.text), int.Parse(inputLevel.text), playerNetworkId.socketId));
        StartCoroutine(SendMatchmakingRequest(playerStats.skinId.ToString(), 1, 1, playerNetworkId.socketId, playerStats.skinId, playerNetworkId.walletAddress));
    }

    private IEnumerator SendMatchmakingRequest(string playerId, int cups, int level, string socketId, int skinId, string walletAddress)
    {
        readyButton.image.sprite = newReadyButtonImg;
        readyButton.onClick.RemoveAllListeners();
        readyButton.onClick.AddListener(SetUpMyGame);
        readyButtonText.text = "I Already payed my transaction";

        string json = JsonUtility.ToJson(new PlayerData(playerId, cups, level, socketId, skinId, walletAddress));
        string myUrl = playerNetworkId.httpUrl + "api/matchmaking/join";


        using (UnityWebRequest request = new UnityWebRequest(myUrl, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Access-Control-Allow-Origin", "*");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                MatchmakingResponse matchmakingResponse = JsonUtility.FromJson<MatchmakingResponse>(request.downloadHandler.text);
                //serverResponse.text = matchmakingResponse.message;
            }
            else
            {
                Debug.LogError("Error en matchmaking: " + request.error);
            }
        }
    }

    private void SetUpMyGame()
    {
        SetUpGame format = new SetUpGame
        {
            type = "readyToSetUp",
            roomId = playerNetworkId.roomId,
        };
        string jsonData = JsonUtility.ToJson(format);
        webSocket.Send(jsonData);
    }

}
