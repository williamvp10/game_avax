using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneManagement : MonoBehaviour
{
    /*public static SceneManagement Instance;

    private void Awake()
    {
        if (Instance == null)
            Instance = this;
    }*/

    public void LoadNormalGame()
    {
        SceneManager.LoadScene("Matchmaking");
    }

    public void LoadPlayToEarn()
    {
        SceneManager.LoadScene("Matchmaking");
    }

    public void ExitGame()
    {
        Application.Quit();
    }
}
