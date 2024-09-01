"use client";

import { useState, useEffect } from "react";
import type { NextPage } from "next";
import MyGame from "~~/components/unity-game/MyGame";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract, useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { TokenBalance } from "./_components/TokenBalance";
import { RoomData } from "./_components/RoomData";
import { ErrorMessage } from "./_components/ErrorMessage";
import { JoinRoomButton } from "./_components/JoinRoomButton";
import { RoomQueryForm } from "./_components/RoomQueryForm";
import { WithdrawWinningsForm } from "./_components/WithdrawWinningsForm";

const GamePlay: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [roomId, setRoomId] = useState<bigint>(BigInt(1)); 
  const [roomData, setRoomData] = useState({
    player1: {
      playerAddress: "",
      points: BigInt(0),
      towersLeft: BigInt(3),
    },
    player2: {
      playerAddress: "",
      points: BigInt(0),
      towersLeft: BigInt(3),
    },
    betAmount: BigInt(0),
    isActive: false,
    winner: "",
    betPaid: false,
    mapOwner: "",
  });
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const { data: seaFortuneContractInfo, isLoading: seaFortuneLoading } = useDeployedContractInfo("SeaFortune");
  const { data: fetchedRoomData, refetch: fetchRoomData } = useScaffoldReadContract({
    contractName: "SeaFortune",
    functionName: "rooms",
    args: [roomId],
  });
  const { writeContractAsync: joinRoomContractAsync } = useScaffoldWriteContract("SeaFortune");
  const { writeContractAsync: approveTokenContractAsync } = useScaffoldWriteContract("CrossChainToken");

  useEffect(() => {
    handleFetchRoomData();
  }, []);

  const handleRoomIdChange = (value: bigint) => {
    setRoomId(value);
  };

  const handleFetchRoomData = async () => {
    setTransactionError(null);
    try {
      const data = await fetchRoomData();

      if (data && data.data) {
        setRoomData({
          player1: {
            playerAddress: data.data[0].playerAddress,
            points: data.data[0].points,
            towersLeft: data.data[0].towersLeft,
          },
          player2: {
            playerAddress: data.data[1].playerAddress,
            points: data.data[1].points,
            towersLeft: data.data[1].towersLeft,
          },
          betAmount: data.data[2],
          isActive: data.data[3],
          winner: data.data[4],
          betPaid: data.data[5],
          mapOwner: data.data[6],
        });
      }

      console.log("Room data:", data.data);
    } catch (e: any) {
      setTransactionError("Error al consultar la sala. Asegúrate de que el ID de la sala es correcto.");
    }
  };

  const handleJoinRoom = async () => {
    setTransactionError(null);

    if (!seaFortuneContractInfo || seaFortuneLoading) {
      setTransactionError("Error al obtener la información del contrato SeaFortune.");
      return;
    }

    try {
      await approveTokenContractAsync({
        functionName: "approve",
        args: [seaFortuneContractInfo.address, roomData.betAmount],
      });

      await joinRoomContractAsync({
        functionName: "joinRoom",
        args: [roomId],
      });

      alert("¡Te has unido al cuarto exitosamente!");
      handleFetchRoomData();
    } catch (e: any) {
      setTransactionError(e.message || "Error al unirse al cuarto.");
    }
  };

  const formatBetAmount = (betAmount: bigint) => {
    return (Number(betAmount) / 1e18).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 18 });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary text-white">
      <h1 className="text-5xl font-bold my-10 text-primary">Sea of Fortune</h1>

      <div className="flex flex-col space-y-6 mb-10 w-full max-w-2xl">
        <div className="flex flex-row space-x-5 w-full max-w-2xl">
          <RoomQueryForm roomId={roomId} handleRoomIdChange={handleRoomIdChange} handleFetchRoomData={handleFetchRoomData} />
          <TokenBalance />
        </div>

        {roomData && <RoomData roomId={roomId} roomData={roomData} formatBetAmount={formatBetAmount} />}

        <ErrorMessage transactionError={transactionError} />

        <JoinRoomButton isActive={roomData.isActive} handleJoinRoom={handleJoinRoom} />
      </div>

      {roomData.winner && (
        <>
          <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-5 text-primary-content mt-4">
            <h2 className="text-2xl font-bold">Ganador</h2>
            <p className="mt-4">
              <strong>El ganador es:</strong> {roomData.winner}
            </p>
          </div>

          <WithdrawWinningsForm roomId={roomId} />
        </>
      )}

      <MyGame connectedAddress={connectedAddress} />
    </div>
  );
};

export default GamePlay;
