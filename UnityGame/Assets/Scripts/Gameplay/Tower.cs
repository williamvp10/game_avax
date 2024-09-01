using System;
using System.Collections;
using System.Collections.Generic;
using Unity.VisualScripting;
using UnityEngine;
using UnityEngine.UI;

[Serializable]
public class SendTowerDamage
{
    public string type;
    public string socketId;
    public string roomId;
    public string towerType;
    public int myTowerId;
    public float damage;
}

[Serializable]
public class RecievedTowerDamage
{
    public string towerType;
    public int myTowerId;
    public List<RecievedTowerHealth> towerHealth;
}

[Serializable]
public class RecievedTowerHealth
{
    public string socketId;
    public float actualLive;
    public float maxLive;
}

public class Tower : MonoBehaviour
{
    [SerializeField] private Image healthBar;
    [SerializeField] public string towerType;
    [SerializeField] public int myTowerId;

    [SerializeField] private float towerHealth;
    [SerializeField] private float maxTowerHealth;

    [SerializeField] public string playerSocketId;

    private void Start()
    {
        UpdateTowerHealthBar();
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if(collision.tag.Equals("MyMinerOrMariner") || collision.tag.Equals("EnemieMinerOrMariner"))
        {
            MinerOrMariner mariner = collision.gameObject.GetComponent<MinerOrMariner>();
            if(playerSocketId != mariner.playerSocketIdCreator)
            {
                SendTowerDamage format = new SendTowerDamage
                {
                    type = "towerDamage",
                    socketId = GameManager.Instance.playerNetworkId.socketId,
                    roomId = GameManager.Instance.playerNetworkId.roomId,
                    towerType = towerType,
                    myTowerId = myTowerId,
                    damage = mariner.minerOrMarinerDamage
                };
                GameManager.Instance.SendDamageTowerDataToServer(format);
            }
            mariner.DestroyMariner();
        }
    }

    public void UpdateTowerHealth(float newHealth, float maxHealth)
    {
        towerHealth = newHealth;
        maxTowerHealth = maxHealth;
        UpdateTowerHealthBar();
    }

    public void UpdateTowerHealthBar()
    {
        healthBar.fillAmount = towerHealth / maxTowerHealth;
    }

}
