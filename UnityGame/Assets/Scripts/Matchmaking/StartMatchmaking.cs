using System;
using System.Collections;
using UnityEngine;
using TMPro;
using UnityEngine.Networking;
using WebSocketSharp;
using UnityEngine.SceneManagement;
using System.Collections.Generic;

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

[System.Serializable]
public class MatchmakingResponse
{
    public string message;
}

[System.Serializable]
public class SocketMessage
{
    public string type;
    public string socketId;
}

[System.Serializable]
public class PlayerData
{
    public string id;
    public int cups;
    public int level;
    public string socketId;
    public int skinId;

    public PlayerData(string id, int cups, int level, string socketId, int skinId)
    {
        this.id = id;
        this.cups = cups;
        this.level = level;
        this.socketId = socketId;
        this.skinId = skinId;
    }
}

public class StartMatchmaking : MonoBehaviour
{
    /*[SerializeField] private TMP_InputField inputID;
    [SerializeField] private TMP_InputField inputCups;
    [SerializeField] private TMP_InputField inputLevel;*/

    [SerializeField] private TextMeshProUGUI serverResponse;
    [SerializeField] private NetworkId playerNetworkId;
    [SerializeField] private PlayerStats playerStats;

    //[SerializeField] private string matchmakingUrl = "https://localhost:3000/api/matchmaking/join";

    private WebSocket webSocket;
    private string roomId;
    private bool startMatch = false;

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
                    ServerMessage serverMessage = JsonUtility.FromJson<ServerMessage>(e.Data);
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
        StartCoroutine(SendMatchmakingRequest(playerStats.skinId.ToString(), 1, 1, playerNetworkId.socketId, playerStats.skinId));
    }

    private IEnumerator SendMatchmakingRequest(string playerId, int cups, int level, string socketId, int skinId)
    {
        string json = JsonUtility.ToJson(new PlayerData(playerId, cups, level, socketId, skinId));
        string myUrl = playerNetworkId.httpUrl + "/api/matchmaking/join";

        using (UnityWebRequest request = new UnityWebRequest(myUrl, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                MatchmakingResponse matchmakingResponse = JsonUtility.FromJson<MatchmakingResponse>(request.downloadHandler.text);
                serverResponse.text = matchmakingResponse.message;
            }
            else
            {
                Debug.LogError("Error en matchmaking: " + request.error);
            }
        }
    }

}
