"use client";

import { useState, useEffect } from "react";
import { useScaffoldWriteContract, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

interface WithdrawWinningsFormProps {
  roomId: bigint;
}

export function WithdrawWinningsForm({ roomId }: WithdrawWinningsFormProps) {
  const { writeContractAsync: withdrawWinningsContractAsync } = useScaffoldWriteContract("SeaFortune");
  const [transactionResult, setTransactionResult] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [eventData, setEventData] = useState<any>(null);

  const handleWithdrawClick = async () => {
    setTransactionError(null);
    setTransactionResult(null);

    try {
      const result = await withdrawWinningsContractAsync({
        functionName: "withdrawWinnings",
        args: [roomId],
      });

      setTransactionResult(`Transaction successful: ${result}`);
    } catch (e: any) {
      setTransactionError(e.message || "Error withdrawing winnings.");
    }
  };

  // Escuchar el evento WinningsWithdrawn
  useScaffoldWatchContractEvent({
    contractName: "SeaFortune",
    eventName: "WinningsWithdrawn",
    onLogs: logs => {
      logs.map(log => {
        const { roomId, winner, amountWon, pointsAmount, communityFee, mapOwnerFee } = log.args;
        setEventData({
          roomId: roomId?.toString()?? "",
          winner,
          amountWon: amountWon?.toString() ?? "",
          pointsAmount: pointsAmount?.toString()?? "",
          communityFee: communityFee?.toString()?? "",
          mapOwnerFee: mapOwnerFee?.toString()?? "",
        });
      });
    },
  });

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col p-5 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-primary-content text-center">Retirar Ganancias</h2>
        <div className="flex justify-center mt-4">
          <button className="btn btn-secondary btn-sm" onClick={handleWithdrawClick}>
            Retirar Ganancias 📡
          </button>
        </div>

        {transactionResult && (
          <div className="bg-green-500 text-white rounded-3xl text-sm px-4 py-2 mt-4 break-words overflow-auto">
            <p className="font-bold m-0 mb-1">Éxito:</p>
            <pre className="whitespace-pre-wrap break-words">{transactionResult}</pre>
          </div>
        )}

        {transactionError && (
          <div className="bg-red-500 text-white rounded-3xl text-sm px-4 py-2 mt-4 break-words overflow-auto">
            <p className="font-bold m-0 mb-1">Error:</p>
            <pre className="whitespace-pre-wrap break-words">{transactionError}</pre>
          </div>
        )}

        {eventData && (
          <div className="bg-blue-500 text-white rounded-3xl text-sm px-4 py-2 mt-4 break-words overflow-auto">
            <p className="font-bold m-0 mb-1">Evento WinningsWithdrawn:</p>
            <pre className="whitespace-pre-wrap break-words">
              ID de la Sala: {eventData.roomId}
              <br />
              Ganador: {eventData.winner}
              <br />
              Monto Ganado: {eventData.amountWon} SFB
              <br />
              Puntos: {eventData.pointsAmount}
              <br />
              Fee Comunidad: {eventData.communityFee} SFB
              <br />
              Fee Dueño del Mapa: {eventData.mapOwnerFee} SFB
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
