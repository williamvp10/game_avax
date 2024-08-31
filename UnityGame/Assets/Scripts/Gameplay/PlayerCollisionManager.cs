using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerCollisionManager : MonoBehaviour
{
    private PlayerLive playerLive;
    private ShipShoot shipShoot;

    private void Start()
    {
        playerLive = GetComponent<PlayerLive>();
        shipShoot = GetComponent<ShipShoot>();
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        Debug.Log("TriggerCollision Detected here " + collision);
        if (collision.transform.tag.Equals("EnemiePlayerBullet") && this.transform.tag == "MyPlayer")
        {
            Debug.Log("Trigger Condition acomplished");
            //Debug.Log(collision.transform.tag + " -- " + transform.tag);
            GameManager.Instance.SendDamageDataToServer(shipShoot.damagePerBullet);
            //playerLive.EnemieImpact(shipShoot.damagePerBullet);
            collision.gameObject.GetComponent<Bullet>().StartBulletDestruction();
        }
    }
}
