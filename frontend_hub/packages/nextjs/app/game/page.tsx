"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import MyGame from "~~/components/unity-game/MyGame";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { TokenBalance } from "./_components/TokenBalance";

const GamePlay: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { data: seaFortuneContractInfo, isLoading: seaFortuneLoading } = useDeployedContractInfo("SeaFortune");
  const [roomId, setRoomId] = useState<bigint>(BigInt(1));
  const [roomData, setRoomData] = useState<any>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  // Hook para leer datos del contrato SeaFortune
  const { data: fetchedRoomData, refetch: fetchRoomData } = useScaffoldReadContract({
    contractName: "SeaFortune",
    functionName: "rooms",
    args: [roomId],
  });

  // Hook para unirse a la sala en SeaFortune
  const { writeContractAsync: joinRoomContractAsync } = useScaffoldWriteContract("SeaFortune");

  // Hook para aprobar la transferencia de tokens al contrato de apuestas
  const { writeContractAsync: approveTokenContractAsync } = useScaffoldWriteContract("CrossChainToken");

  useEffect(() => {
    setRoomId(BigInt(1)); // ID de la sala fija por ahora
    if (fetchedRoomData) {
      console.log("Fetched room data:", fetchedRoomData);
      setRoomData(fetchedRoomData);
    }
  }, [fetchedRoomData]);

  const handleJoinRoom = async () => {
    setTransactionError(null);

    if (!seaFortuneContractInfo || seaFortuneLoading) {
      setTransactionError("Error al obtener la información del contrato SeaFortune.");
      return;
    }

    try {
      // Primero, aprobamos la transferencia de tokens al contrato de apuestas
      await approveTokenContractAsync({
        functionName: "approve",
        args: [seaFortuneContractInfo.address, roomData?.betAmount],
      });

      // Luego, intentamos unirnos a la sala
      await joinRoomContractAsync({
        functionName: "joinRoom",
        args: [roomId],
      });

      alert("¡Te has unido al cuarto exitosamente!");
      fetchRoomData(); // Refresca los datos del cuarto después de unirse
    } catch (e: any) {
      setTransactionError(e.message || "Error al unirse al cuarto.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary text-white">
      <h1 className="text-5xl font-bold my-10 text-primary">Sea of Fortune</h1>

      <div className="flex flex-row space-x-6 mb-10">
        {roomData && (
          <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-5 w-full max-w-sm text-primary">
            <h2 className="text-2xl font-bold text-primary-content">Datos de la Sala</h2>
            <p className="mt-4">
              <strong>ID de la Sala:</strong> {roomId.toString()}
            </p>
            <p>
              <strong>Jugador 1:</strong> {roomData.player1 ? roomData.player1.playerAddress : "No asignado"}
            </p>
            <p>
              <strong>Jugador 2:</strong> {roomData.player2 ? roomData.player2.playerAddress : "No asignado"}
            </p>
            <p>
              <strong>Apuesta:</strong> {roomData.betAmount ? roomData.betAmount.toString() : 0} wei
            </p>
          </div>
        )}

        <TokenBalance /> {/* Incluye el componente de balance de tokens */}

        {transactionError && (
          <div className="bg-red-500 text-white rounded-3xl text-sm px-4 py-2 w-full max-w-sm">
            <p className="font-bold m-0 mb-1">Error:</p>
            <pre className="whitespace-pre-wrap break-words">{transactionError}</pre>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-4 mb-10">
        <button className="btn btn-primary btn-lg" onClick={handleJoinRoom}>
          Unirse al Cuarto
        </button>
      </div>

      <MyGame connectedAddress={connectedAddress} />
    </div>
  );
};

export default GamePlay;
