using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ShipShoot : MonoBehaviour
{
    public Transform[] leftCannons;
    public Transform[] rightCannons;
    public GameObject shootPreviewPrefab;
    public GameObject bulletPrefab;

    public GameObject spawnPointMinerOrMariner;
    public GameObject minerOrMariner;

    public float maxDistance = 10f;
    public float shootSpeed = 5f;
    public float damagePerBullet = 5f;
    public float bulletManaCost = 5f;
    public float minerOrMarinerManaCost = 15f;

    private GameObject[] leftPreviews;
    private GameObject[] rightPreviews;

    private PlayerStats playerStats;

    private void Start()
    {
        playerStats = GameManager.Instance.playerStats;
        maxDistance = playerStats.shootMaxDistance;
        shootSpeed = playerStats.shootSpeed;
        damagePerBullet = playerStats.damagePerBullet;
    }

    void Update()
    {
        if (transform.tag.Equals("MyPlayer"))
        {
            HandleInput();

            if (Input.GetKey(KeyCode.Z))
                UpdateShootPreview(leftPreviews, leftCannons);

            if (Input.GetKey(KeyCode.X))
                UpdateShootPreview(rightPreviews, rightCannons);

            if (Input.GetKeyDown(KeyCode.C) && ResourcesManager.Instance.myActualMana > minerOrMarinerManaCost)
                FireMinerOrMariner();
        }
    }

    private void HandleInput()
    {
        if (Input.GetKeyDown(KeyCode.Z) && ResourcesManager.Instance.myActualMana > bulletManaCost)
            leftPreviews = CreateShootPreviews(leftCannons);

        if (Input.GetKeyUp(KeyCode.Z))
            FireBullets(leftPreviews, leftCannons);

        if (Input.GetKeyDown(KeyCode.X) && ResourcesManager.Instance.myActualMana > bulletManaCost)
            rightPreviews = CreateShootPreviews(rightCannons);

        if (Input.GetKeyUp(KeyCode.X))
            FireBullets(rightPreviews, rightCannons);
    }

    private GameObject[] CreateShootPreviews(Transform[] cannons)
    {
        GameObject[] previews = new GameObject[cannons.Length];
        for (int i = 0; i < cannons.Length; i++)
        {
            GameObject preview = Instantiate(shootPreviewPrefab, cannons[i].position, cannons[i].rotation);
            preview.transform.parent = cannons[i];  // Hacer la bala hija del ca��n
            previews[i] = preview;
        }
        return previews;
    }

    private void UpdateShootPreview(GameObject[] previews, Transform[] cannons)
    {
        for (int i = 0; i < previews.Length; i++)
        {
            if (previews[i] != null)
            {
                float currentDistance = Vector2.Distance(cannons[i].position, previews[i].transform.position);
                if (currentDistance < maxDistance)
                    previews[i].transform.position += cannons[i].right * shootSpeed * Time.deltaTime;
            }
        }
    }

    private void FireBullets(GameObject[] previews, Transform[] cannons)
    {
        List<BulletData> bulletsData = new List<BulletData>();

        for (int i = 0; i < cannons.Length; i++)
        {
            if (previews[i] != null)
            {
                Vector3 firePosition = previews[i].transform.position;
                Destroy(previews[i]);

                // Crear la bala y asignar la posici�n objetivo
                GameObject bullet = Instantiate(bulletPrefab, cannons[i].position, cannons[i].rotation);
                bullet.transform.tag = "MyPlayerBullet";
                ResourcesManager.Instance.SpendMana(bulletManaCost);
                // Asignar la posici�n objetivo a la bala
                Bullet bulletScript = bullet.GetComponent<Bullet>();
                bulletScript.SetTarget(firePosition, shootSpeed);

                bulletsData.Add(new BulletData
                {
                    Position = cannons[i].position,
                    Rotation = cannons[i].rotation.eulerAngles,
                    TargetPosition = firePosition,
                    ShootSpeed = shootSpeed
                });
            }
        }

        GameManager.Instance.SendBulletsDataToServer(bulletsData);
    }

    private void FireMinerOrMariner()
    {
        // Usar el punto de spawn para la posici�n y la rotaci�n del objeto padre para la direcci�n
        Vector3 spawnPosition = spawnPointMinerOrMariner.transform.position;
        Quaternion spawnRotation = transform.rotation;

        GameObject minerOrMarinerInstance = Instantiate(minerOrMariner, spawnPosition, spawnRotation);
        minerOrMarinerInstance.tag = "MyMinerOrMariner";
        ResourcesManager.Instance.SpendMana(minerOrMarinerManaCost);

        // Lanzar el minerOrMariner como un proyectil
        Rigidbody2D rb = minerOrMarinerInstance.GetComponent<Rigidbody2D>();
        if (rb != null)
            rb.velocity = spawnPointMinerOrMariner.transform.right * shootSpeed * 0.5f;
    }
}
