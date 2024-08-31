using UnityEngine;

[CreateAssetMenu(fileName = "PlayerStats", menuName = "Player/PlayerStats")]
public class PlayerStats : ScriptableObject
{
    public int skinId;
    public float live;
    public float shootSpeed;
    public float shootMaxDistance;
    public float damagePerBullet;
    public float maxSpeed;
    public float acceleration;
    public float deceleration;
    public float rotationSpeed;
    public float shipLevel;
}
