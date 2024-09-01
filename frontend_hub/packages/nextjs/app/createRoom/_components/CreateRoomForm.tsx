"use client";

import { useState } from "react";
import { IntegerInput } from "~~/components/scaffold-eth";
import { AddressInput } from "~~/components/scaffold-eth";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import Link from "next/link";

export function CreateRoomForm() {
  const { writeContractAsync: createRoomContractAsync } = useScaffoldWriteContract("SeaFortune");
  const [formData, setFormData] = useState({
    betAmount: BigInt(0),
    mapOwner: "",
  });

  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const handleBetAmountChange = (value: bigint) => {
    setFormData(prevState => ({
      ...prevState,
      betAmount: value,
    }));
  };

  const handleMapOwnerChange = (value: string) => {
    setFormData(prevState => ({
      ...prevState,
      mapOwner: value,
    }));
  };

  const handleCreateRoomClick = async () => {
    setTransactionResult(null);
    setTransactionError(null);

    try {
      const result = await createRoomContractAsync({
        functionName: "registerRoom",
        args: [formData.betAmount, formData.mapOwner],
      });
      setTransactionResult(result);
    } catch (e: any) {
      setTransactionError(e.message || "Error creating room");
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 flex flex-col mt-10 relative max-w-screen-md w-full mx-4 sm:mx-auto">
        <div className="p-5 divide-y divide-base-300">
          <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
            <h1 className="text-2xl font-bold text-primary-content text-center">Crear Cuarto</h1>
            <p className="font-medium my-0 break-words text-primary-content text-center">Vamos a crear un nuevo cuarto</p>
            
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-primary-content">Cantidad de la Apuesta (en wei)</label>
              <IntegerInput
                placeholder="Bet Amount (in wei)"
                name="betAmount"
                value={formData.betAmount}
                onChange={(value: string | bigint) => handleBetAmountChange(value as bigint)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-primary-content">Dirección del Dueño del Mapa</label>
              <AddressInput
                placeholder="Map Owner Address"
                name="mapOwner"
                value={formData.mapOwner}
                onChange={handleMapOwnerChange}
              />
            </div>

            <div className="flex justify-center mt-4">
              <button className="btn btn-secondary btn-sm" onClick={handleCreateRoomClick}>
                Crear Cuarto 📡
              </button>
            </div>

            {transactionResult && (
              <div className="bg-secondary rounded-3xl text-sm px-4 py-2 mt-4 break-words overflow-auto">
                <p className="font-bold m-0 mb-1 text-primary-content">Resultado:</p>
                <pre className="whitespace-pre-wrap break-words text-primary">{JSON.stringify(transactionResult, null, 2)}</pre>
              </div>
            )}

            {transactionError && (
              <div className="bg-red-500 text-white rounded-3xl text-sm px-4 py-2 mt-4 break-words overflow-auto">
                <p className="font-bold m-0 mb-1 text-primary-content">Error:</p>
                <pre className="whitespace-pre-wrap break-words">{transactionError}</pre>
              </div>
            )}

            {transactionResult && (
            <div className="flex justify-center mt-4">
              <Link href="/game" passHref>
                <button className="btn btn-primary btn-sm">
                  Ir al Juego 🎮
                </button>
              </Link>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
