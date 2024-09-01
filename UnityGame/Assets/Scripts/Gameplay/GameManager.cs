using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using WebSocketSharp;
using Newtonsoft.Json.Linq;
using UnityEngine.UIElements;
using Newtonsoft.Json;
using UnityEngine.SceneManagement;
using TMPro;

[Serializable]
public class ReadyToStartMessage
{
    public string type;
    public string socketId;
    public string roomId;
}

[Serializable]
public class UpdatePositionMessage
{
    public string type;
    public string roomId;
    public float x;
    public float y;
    public float z;
}

[System.Serializable]
public class BulletData
{
    public Vector3 Position;
    public Vector3 Rotation;
    public Vector3 TargetPosition;
    public float ShootSpeed;
}

[Serializable]
public class BulletFormat
{
    public string type;
    public string socketId;
    public string roomId;
    public List<BulletData> data;
}

[System.Serializable]
public class BulletDataWrapper
{
    public BulletData[] bullets;
}

[Serializable]
public class UpdatePlayerHealth
{
    public string type;
    public string socketId;
    public string roomId;
    public float damage;
}

[Serializable]
public class MinerSendFinalData
{
    public string type;
    public string socketId;
    public string roomId;
    public MinerSendData data;
}

[System.Serializable]
public class MinerSendData
{
    public Vector3 Position;
    public Quaternion Rotation;
    public float ShootSpeed;
}

[System.Serializable]
public class MinerRecievedData
{
    public Vector3 Position;
    public Quaternion Rotation;
    public float ShootSpeed;
}

public class GameManager : MonoBehaviour
{
    public static GameManager Instance;

    [SerializeField] private NetworkId playerNetworkId;
    [SerializeField] private List<GameObject> players;
    private GameObject myPlayer;
    private GameObject enemiePlayer;

    [SerializeField] private GameObject gameOverCanvas;
    [SerializeField] private TextMeshProUGUI gameOverText;
    private string myGameOverText;

    [SerializeField] private GameObject bulletPrefab;
    private BulletData[] bulletsData;

    [SerializeField] private GameObject minerOrMarinePrefab;
    private MinerRecievedData minerRecievedData;

    private WebSocket webSocket;

    private float myX;
    private float myY;
    private float myZ;
    private float myHelath;

    private float othX;
    private float othY;
    private float othZ;
    private float enemieHelath;
    private int enemieSkinId;

    private bool playersInstantiation = false;
    private bool setMyPlayerPos = false;
    private bool setOthPlayersPos = false;
    private bool bulletCreation = false;
    private bool updateHealthBars = false;
    private bool mineOrMarinerCreation = false;
    private bool gameOver = false;

    [SerializeField] public PlayerStats playerStats;

    private void Awake()
    {
        Instance = this;
    }

    private void Start()
    {
        webSocket = playerNetworkId.webSocket;
        webSocket.OnMessage += OnMessageReceived;

        ReadyToStartMessage readyMessage = new ReadyToStartMessage
        {
            type = "readyToStart",
            socketId = playerNetworkId.socketId,
            roomId = playerNetworkId.roomId
        };
        string json = JsonUtility.ToJson(readyMessage);
        webSocket.Send(json);
    }

    private void OnMessageReceived(object sender, MessageEventArgs e)
    {
        try
        {
            JObject parsedData = JObject.Parse(e.Data);

            string message = parsedData["message"].ToString();

            if(message == "startFight")
            {
                string roomId = parsedData["data"]["roomId"].ToString();

                foreach (JObject pos in parsedData["data"]["initialPositions"])
                {
                    string socketId = pos["socketId"].ToString();
                    float x = (float)pos["x"];
                    float y = (float)pos["y"];
                    float z = (float)pos["z"];
                    int skinId = (int)pos["skinId"];

                    if (socketId == playerNetworkId.socketId)
                    {
                        myX = x;
                        myY = y;
                        myZ = z;
                        //Debug.Log("My initial pos: " + x + " -- " + y + " Rot: " + z);
                    }
                    else
                    {
                        othX = x;
                        othY = y;
                        othZ = z;
                        enemieSkinId = skinId;
                    }
                }
                playersInstantiation = true;
                //setMyPlayerPos = true;
                //setOthPlayersPos = true;
            }

            if (message == "updatePosition")
            {
                foreach (JObject pos in parsedData["data"]["playerPositions"])
                {
                    string socketId = pos["socketId"].ToString();
                    float x = (float)pos["x"];
                    float y = (float)pos["y"];
                    float z = (float)pos["z"];

                    if (socketId != playerNetworkId.socketId)  // Actualiza la posición del enemigo
                    {
                        //Debug.Log("Must update enemie pos: " + x + " -- " + y + " Rot: " + z);
                        othX = x;
                        othY = y;
                        othZ = z;
                        setOthPlayersPos = true;
                    }
                }
            }

            if (message == "spawnBullets")
            {
                string bulletsDataJson = parsedData["data"]["bulletsData"].ToString();
                bulletsData = JsonConvert.DeserializeObject<BulletData[]>(bulletsDataJson);
                bulletCreation = true;
            }

            if (message == "spawnMineOrMiner")
            {
                string mineOrMinerDataJson = parsedData["data"]["mineOrMinerData"].ToString();
                minerRecievedData = JsonConvert.DeserializeObject<MinerRecievedData>(mineOrMinerDataJson);
                mineOrMarinerCreation = true;
            }

            if (message == "updateHealth")
            {
                foreach (JObject health in parsedData["data"]["playerHealth"])
                {
                    if (health["socketId"].ToString() == playerNetworkId.socketId)
                        myHelath = (float)health["actualLive"];
                    else
                        enemieHelath = (float)health["actualLive"];
                }

                updateHealthBars = true;
            }

            if (message == "gameOver")
            {
                if (parsedData["data"]["winnerId"].ToString() == playerNetworkId.socketId)
                    myGameOverText = "YOU WON!";
                else
                    myGameOverText = "YOU LOSE!";

                gameOver = true;
            }
        }
        catch (Exception ex)
        {
            Debug.LogError("Error deserializing JSON: " + ex.Message);
        }
    }

    private void Update()
    {
        if (playersInstantiation)
        {
            myPlayer = InstantiatePlayer(players[playerStats.skinId], myX, myY, myZ, "MyPlayer");
            enemiePlayer = InstantiatePlayer(players[enemieSkinId], othX, othY, othZ, "EnemiePlayer");
            ResourcesManager.Instance.SetUICanvas(myX, myPlayer);
            playersInstantiation = false;
        }

        if (setOthPlayersPos)
        {
            SetPlayerPosition(enemiePlayer, othX, othY, othZ);
            setOthPlayersPos = false;
        }

        if (bulletCreation)
        {
            foreach (var bulletData in bulletsData)
                InstantiateBullet(bulletData);
            bulletCreation=false;
        }

        if (mineOrMarinerCreation)
        {
            InstantiateMineOrMiner(minerRecievedData);
            mineOrMarinerCreation = false;
        }

        if (updateHealthBars)
        {
            myPlayer.GetComponent<PlayerLive>().playerLive = myHelath;
            myPlayer.GetComponent<PlayerLive>().UpdateLiveeBarUI();

            enemiePlayer.GetComponent<PlayerLive>().playerLive = enemieHelath;
            enemiePlayer.GetComponent<PlayerLive>().UpdateLiveeBarUI();
            updateHealthBars = false;
        }

        if (gameOver)
        {
            gameOverCanvas.SetActive(true);
            gameOverText.text = myGameOverText;
        }
    }

    private GameObject InstantiatePlayer(GameObject player, float x, float y, float z, string objectTag)
    {
        Vector3 playerPosition = new Vector3(x, y, 0.0f);
        Quaternion playerRotation = Quaternion.Euler(0,0,z);

        GameObject newPlayer = Instantiate(player, playerPosition, playerRotation);
        newPlayer.transform.tag = objectTag;

        return newPlayer;
    }

    private void SetPlayerPosition(GameObject player, float x, float y, float z)
    {
        //Debug.Log("Getting inside set enemie position");
        if (player != null)
        {
            //Debug.Log("I must update player " + player.tag);
            player.transform.position = new Vector3(x, y, player.transform.position.z);
            player.transform.rotation = Quaternion.Euler(0, 0, z);
        }
    }

    void InstantiateBullet(BulletData bulletData)
    {
        GameObject bullet = Instantiate(bulletPrefab, bulletData.Position, Quaternion.Euler(bulletData.Rotation));
        bullet.transform.tag = "EnemiePlayerBullet";
        Bullet bulletScript = bullet.GetComponent<Bullet>();
        bulletScript.SetTarget(bulletData.TargetPosition, bulletData.ShootSpeed);
    }

    void InstantiateMineOrMiner(MinerRecievedData minerRecievedData)
    {
        GameObject minerOrMarinerInstance = Instantiate(minerOrMarinePrefab, minerRecievedData.Position, minerRecievedData.Rotation);
        minerOrMarinerInstance.tag = "EnemieMinerOrMariner"; // Cambia el tag si es necesario

        // Aplicar la velocidad al Rigidbody2D
        Rigidbody2D rb = minerOrMarinerInstance.GetComponent<Rigidbody2D>();
        if (rb != null)
            rb.velocity = minerOrMarinerInstance.transform.up * minerRecievedData.ShootSpeed * -0.5f;
    }

    public void SendPositionUpdate(GameObject player)
    {
        //Debug.Log("Im sending to server: " + player.transform.position.x + " -- " + player.transform.position.y + " -- " + player.transform.eulerAngles.z);
        UpdatePositionMessage updateMessage = new UpdatePositionMessage
        {
            type = "updatePosition",
            roomId = playerNetworkId.roomId,
            x = player.transform.position.x,
            y = player.transform.position.y,
            z = player.transform.eulerAngles.z
        };

        string json = JsonUtility.ToJson(updateMessage);
        webSocket.Send(json);
    }

    public void SendBulletsDataToServer(List<BulletData> bulletsData)
    {
        BulletFormat format = new BulletFormat
        {
            type = "fireBullets",
            socketId = playerNetworkId.socketId,
            roomId = playerNetworkId.roomId,
            data = bulletsData
        };
        string jsonData = JsonUtility.ToJson(format);
        webSocket.Send(jsonData);
    }

    public void SendDamageDataToServer(float damage)
    {
        UpdatePlayerHealth format = new UpdatePlayerHealth
        {
            type = "playerDamage",
            socketId = playerNetworkId.socketId,
            roomId = playerNetworkId.roomId,
            damage = damage
        };
        string jsonData = JsonUtility.ToJson(format);
        webSocket.Send(jsonData);
    }

    public void SendMinerOrMarinerToServer(MinerSendData data)
    {
        MinerSendFinalData format = new MinerSendFinalData
        {
            type = "fireMinerOrMariner",
            socketId = playerNetworkId.socketId,
            roomId = playerNetworkId.roomId,
            data = data,
        };
        string jsonData = JsonUtility.ToJson(format);
        webSocket.Send(jsonData);
    }

    public void ReturnToHome()
    {
        SceneManager.LoadScene("Matchmaking");
    }
}
