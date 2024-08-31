using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ShipShoot : MonoBehaviour
{
    public Transform[] leftCannons;
    public Transform[] rightCannons;
    public GameObject shootPreviewPrefab;
    public GameObject bulletPrefab;
    public float maxDistance = 10f;
    public float shootSpeed = 5f;
    public float damagePerBullet = 5f;

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
        }
    }

    private void HandleInput()
    {
        if (Input.GetKeyDown(KeyCode.Z))
            leftPreviews = CreateShootPreviews(leftCannons);

        if (Input.GetKeyUp(KeyCode.Z))
            FireBullets(leftPreviews, leftCannons);

        if (Input.GetKeyDown(KeyCode.X))
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
            preview.transform.parent = cannons[i];  // Hacer la bala hija del cañón
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

                // Crear la bala y asignar la posición objetivo
                GameObject bullet = Instantiate(bulletPrefab, cannons[i].position, cannons[i].rotation);
                bullet.transform.tag = "MyPlayerBullet";
                // Asignar la posición objetivo a la bala
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
}
