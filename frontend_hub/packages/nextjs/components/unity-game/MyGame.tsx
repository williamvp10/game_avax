import React, { useCallback, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

type MyGameProps = {
  connectedAddress?: string;
};

export default function MyGame({ connectedAddress }: MyGameProps) {
  const { unityProvider, sendMessage } = useUnityContext({
    loaderUrl: "/unity/Build/PiratesGameWbgl.loader.js",
    dataUrl: "/unity/Build/PiratesGameWbgl.data.unityweb",
    frameworkUrl: "/unity/Build/PiratesGameWbgl.framework.js.unityweb",
    codeUrl: "/unity/Build/PiratesGameWbgl.wasm.unityweb",
  });

  // Function to send the address to Unity
  const sendAddressToUnity = useCallback(() => {
    if (connectedAddress) {
      console.log("data send to unity jeje");
      sendMessage("UserManager", "SetPlayerAddress", connectedAddress);
    }
  }, [connectedAddress, sendMessage]);

  // Use useEffect to watch for changes in connectedAddress and trigger the message to Unity
  useEffect(() => {
    sendAddressToUnity();
  }, [connectedAddress, sendAddressToUnity]);

  return (
    <div>
      <p>Unity Game</p>
      <Unity unityProvider={unityProvider} style={{ width: "1100px", height: "618px", border: "solid black 1px" }} />
    </div>
  );
}
