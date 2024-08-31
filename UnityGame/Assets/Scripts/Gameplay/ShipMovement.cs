using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ShipMovement : MonoBehaviour
{
    public float maxSpeed = 5f;

    public float acceleration = 2f;
    public float deceleration = 4f;
    public float rotationSpeed = 100f;
    public bool isAnchored = true;

    private Rigidbody2D rb;
    private float horizontalInput;

    private PlayerStats playerStats;

    void Start()
    {
        playerStats = GameManager.Instance.playerStats;
        maxSpeed = playerStats.maxSpeed;
        acceleration = playerStats.acceleration;
        deceleration = playerStats.deceleration;
        rotationSpeed = playerStats.rotationSpeed;

        rb = GetComponent<Rigidbody2D>();

    }

    void Update()
    {
        if (transform.tag.Equals("MyPlayer"))
        {
            horizontalInput = Input.GetAxis("Horizontal");

            if (rb.velocity.magnitude > 0.1f)
                transform.Rotate(0, 0, -horizontalInput * rotationSpeed * Time.deltaTime);


            if (!isAnchored)
                rb.velocity = Vector2.Lerp(rb.velocity, -transform.up * maxSpeed, acceleration * Time.deltaTime);

            GameManager.Instance.SendPositionUpdate(this.gameObject);

            if (Input.GetKeyDown(KeyCode.Space))
            {
                if (isAnchored)
                    RaiseAnchor();
                else
                    DropAnchor();
            }
        }
    }

    void DropAnchor()
    {
        isAnchored = true;
        StartCoroutine(Decelerate());
        StartCoroutine(RotateShipOnAnchor());
    }

    void RaiseAnchor()
    {
        isAnchored = false;
    }

    IEnumerator Decelerate()
    {
        while (rb.velocity.magnitude > 0.1f)
        {
            rb.velocity = Vector2.Lerp(rb.velocity, Vector2.zero, deceleration * Time.deltaTime);
            yield return null;
        }
        rb.velocity = Vector2.zero;
    }

    IEnumerator RotateShipOnAnchor()
    {
        float targetAngle = 0;
        if (horizontalInput < 0)
            targetAngle = transform.eulerAngles.z + 60f;
        else
            targetAngle = transform.eulerAngles.z - 60f;

        float currentAngle = transform.eulerAngles.z;
        float rotationSpeed = 200f;

        while (Mathf.Abs(Mathf.DeltaAngle(currentAngle, targetAngle)) > 0.1f)
        {
            currentAngle = Mathf.LerpAngle(currentAngle, targetAngle, rotationSpeed * Time.deltaTime);
            transform.eulerAngles = new Vector3(0, 0, currentAngle);
            yield return null;
        }

        transform.eulerAngles = new Vector3(0, 0, targetAngle); // Asegurarse que se completa el giro
    }

    /*public void FirstShipPosition()
    {
        float x = GameManager.Instance.myX;
        float y = GameManager.Instance.myY;
        this.transform.position = new Vector3(x, y, transform.position.z);

        GameManager.Instance.SendPositionUpdate();
    }*/
}
