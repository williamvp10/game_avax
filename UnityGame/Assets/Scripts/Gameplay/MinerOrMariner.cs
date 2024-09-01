using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class MinerOrMariner : MonoBehaviour
{
    public float minerOrMarinerDamage = 20f;
    public string playerSocketIdCreator;
    private Animator animator;

    private void Start()
    {
        animator = GetComponent<Animator>();
    }

    public void DestroyMariner()
    {
        animator.SetBool("Destroy", true);
    }

    public void DestroyMarinerObject()
    {
        Destroy(gameObject);
    }
}
