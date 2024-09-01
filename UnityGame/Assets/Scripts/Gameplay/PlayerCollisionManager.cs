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
        if (collision.transform.tag.Equals("EnemiePlayerBullet") && this.transform.tag == "MyPlayer")
        {
            GameManager.Instance.SendDamageDataToServer(shipShoot.damagePerBullet);
            collision.gameObject.GetComponent<Bullet>().StartBulletDestruction();
        }
        if (collision.transform.tag.Equals("EnemieMinerOrMariner") && this.transform.tag == "MyPlayer")
        {
            MinerOrMariner mariner = collision.gameObject.GetComponent<MinerOrMariner>();
            GameManager.Instance.SendDamageDataToServer(mariner.minerOrMarinerDamage);
            mariner.DestroyMariner();
        }
    }
}
