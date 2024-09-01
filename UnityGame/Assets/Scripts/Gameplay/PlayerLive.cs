using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PlayerLive : MonoBehaviour
{
    [SerializeField] private Image liveBar;

    public float playerLive;
    public float maxPlayerLive;

    private PlayerStats playerStats;

    private void Start()
    {
        playerStats = GameManager.Instance.playerStats;
        playerLive = playerStats.live;
        maxPlayerLive = playerStats.live;

        UpdateLiveeBarUI();
    }

    public void UpdateLiveeBarUI()
    {
        liveBar.fillAmount = playerLive/maxPlayerLive;
    }

    public void SetNewLiveBar(Image newLiveBar)
    {
        liveBar = newLiveBar;
        UpdateLiveeBarUI();
    }
}
