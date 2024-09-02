using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using System.IO;
using TMPro;
using Newtonsoft.Json.Linq;

public class NFTExplorer : MonoBehaviour
{
    [SerializeField] private List<Sprite> skins;
    [SerializeField] private Image image;
    [SerializeField] private GameObject shipStatsPanel;
    [SerializeField] private PlayerStats playerStats;
    [SerializeField] private TextMeshProUGUI shipName;

    private int currentIndex = 0;
    private JArray parsedData;

    private void Start()
    {
        string path = Path.Combine(Application.streamingAssetsPath, "MyNFT.json");
        if (File.Exists(path))
        {
            string jsonString = File.ReadAllText(path);
            parsedData = JArray.Parse(jsonString);
        }

        if (parsedData.Count > 0)
            UpdateUI();
    }

    public void NextNFT()
    {
        currentIndex = (currentIndex + 1) % parsedData.Count;

        UpdateUI();
    }

    public void PrevNFT()
    {
        currentIndex--;
        if (currentIndex < 0)
            currentIndex = parsedData.Count - 1;

        UpdateUI();
    }

    private void UpdateUI()
    {
        if (image != null && parsedData.Count > 0)
        {
            JObject objectParsedData = (JObject)parsedData[currentIndex];

            shipName.text = objectParsedData["name"].ToString();

            JArray attributes = (JArray)objectParsedData["attributes"];

            //Debug.Log("Attributes: " + attributes);

            int counter = 0;

            foreach (JObject attribute in attributes)
            {
                string traitType = attribute["trait_type"].ToString();
                float value = attribute["value"].ToObject<float>(); // Convierte a float ya que la mayoría de los valores son float

                switch (traitType)
                {
                    case "Live":
                        playerStats.live = value;
                        break;
                    case "ShootSpeed":
                        playerStats.shootSpeed = value;
                        break;
                    case "ShootMaxDistance":
                        playerStats.shootMaxDistance = value;
                        break;
                    case "DamagePerBullet":
                        playerStats.damagePerBullet = value;
                        break;
                    case "MaxSpeed":
                        playerStats.maxSpeed = value;
                        break;
                    case "Acceleration":
                        playerStats.acceleration = value;
                        break;
                    case "Deceleration":
                        playerStats.deceleration = value;
                        break;
                    case "RotationSpeed":
                        playerStats.rotationSpeed = value;
                        break;
                    case "ShipLevel":
                        playerStats.shipLevel = value;
                        break;
                    case "SkinId":
                        playerStats.skinId = (int)value; // Asegúrate de que SkinId sea un entero
                        image.sprite = skins[playerStats.skinId]; // Asigna la skin correspondiente
                        break;
                    default:
                        shipStatsPanel.transform.GetChild(counter).GetChild(0).GetChild(0).GetComponent<TextMeshProUGUI>().text = traitType;
                        counter++;
                        break;
                }
            }
        }
    }
}