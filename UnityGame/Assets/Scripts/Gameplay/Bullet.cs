using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Bullet : MonoBehaviour
{
    private Vector3 targetPosition;
    private float shootSpeed;
    private Animator animator;

    private Coroutine moveCoroutine;
    private bool isDestroying = false;

    private void Start()
    {
        animator = GetComponent<Animator>();
    }

    public void SetTarget(Vector3 targetPosition, float shootSpeed)
    {
        this.targetPosition = targetPosition;
        this.shootSpeed = shootSpeed;

        // Iniciar el movimiento hacia la posición objetivo
        moveCoroutine = StartCoroutine(MoveToTarget());
    }

    private IEnumerator MoveToTarget()
    {
        while (Vector3.Distance(transform.position, targetPosition) > 0.01f)
        {
            if (isDestroying) yield break;
            // Mover la bala hacia la posición objetivo
            transform.position = Vector3.MoveTowards(transform.position, targetPosition, shootSpeed * Time.deltaTime);
            yield return null;
        }

        // Aquí se debe realizar la animación de destrucción
        // Destruir la bala al alcanzar la posición objetivo
        StartBulletDestruction();
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collision.tag.Equals("Player1Tower") || collision.tag.Equals("Player2Tower") || collision.tag.Equals("NeutralTower") || collision.tag.Equals("EnemiePlayer"))
            StartBulletDestruction();
    }

    public void StartBulletDestruction()
    {
        if (isDestroying) return;
        isDestroying = true;
        if (moveCoroutine != null)
            StopCoroutine(moveCoroutine);

        animator.SetBool("Destroy", true);
    }

    public void DestroyBulletObject()
    {
        Destroy(gameObject);
    }
}
