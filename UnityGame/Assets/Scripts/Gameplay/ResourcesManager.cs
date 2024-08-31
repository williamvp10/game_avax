using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ResourcesManager : MonoBehaviour
{
    public static ResourcesManager Instance;

    [SerializeField] private GameObject player1Canvas;
    [SerializeField] private GameObject player2Canvas;

    [SerializeField] private Image player1HealthImage;
    [SerializeField] private Image player1ResourcesImage;

    [SerializeField] private Image player2HealthImage;
    [SerializeField] private Image player2ResourcesImage;

    [SerializeField] private int maxMana = 100; // Cantidad máxima de maná
    [SerializeField] private int manaIncrement = 5; // Cantidad de maná a añadir cada intervalo
    [SerializeField] private float manaRegenInterval = 2f; // Intervalo de regeneración en segundos

    private float player1CurrentMana;
    private float player2CurrentMana;

    private bool isPlayerOne = false;

    private void Awake()
    {
        Instance = this;
        player1CurrentMana = maxMana;
        player2CurrentMana = maxMana;
    }

    private void Start()
    {
        StartCoroutine(RegenerateMana());
    }

    private IEnumerator RegenerateMana()
    {
        while (true)
        {
            yield return new WaitForSeconds(manaRegenInterval);
            if (isPlayerOne)
            {
                player1CurrentMana = Mathf.Min(player1CurrentMana + manaIncrement, maxMana);
                UpdateManaUI(player1ResourcesImage, player1CurrentMana);
            }
            else
            {
                player2CurrentMana = Mathf.Min(player2CurrentMana + manaIncrement, maxMana);
                UpdateManaUI(player2ResourcesImage, player2CurrentMana);
            }
        }
    }

    public void SetUICanvas(float myX, GameObject player)
    {
        player.transform.GetChild(4).gameObject.SetActive(false);
        if (myX == -7.75f)
        {
            isPlayerOne = true;
            player1Canvas.SetActive(true);
            player2Canvas.SetActive(false);
            player.GetComponent<PlayerLive>().SetNewLiveBar(player1HealthImage);
        }
        else
        {
            isPlayerOne = false;
            player1Canvas.SetActive(false);
            player2Canvas.SetActive(true);
            player.GetComponent<PlayerLive>().SetNewLiveBar(player2HealthImage);
        }
    }

    // Método para gastar maná
    public bool SpendMana(float amount)
    {
        if (isPlayerOne)
        {
            if (player1CurrentMana >= amount)
            {
                player1CurrentMana -= amount;
                UpdateManaUI(player1ResourcesImage, player1CurrentMana);
                return true;
            }
        }
        else
        {
            if (player2CurrentMana >= amount)
            {
                player2CurrentMana -= amount;
                UpdateManaUI(player2ResourcesImage, player2CurrentMana);
                return true;
            }
        }
        return false;
    }

    private void UpdateManaUI(Image manaImage, float currentMana)
    {
        manaImage.fillAmount = currentMana / maxMana;
    }
}