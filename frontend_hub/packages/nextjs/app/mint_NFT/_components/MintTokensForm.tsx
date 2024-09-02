"use client";

import { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { IntegerInput } from "~~/components/scaffold-eth";
import { AddressInput } from "~~/components/scaffold-eth";

export function MintTokensForm() {
  const { writeContractAsync: mintTokensContractAsync } = useScaffoldWriteContract("CrossChainToken");
  const [formData, setFormData] = useState({
    toAddress: "",
    mintAmount: BigInt(0),
  });
  const [transactionResult, setTransactionResult] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const handleInputChange = (name: string, value: string | bigint) => {
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleMintTokensClick = async () => {
    setTransactionError(null);
    setTransactionResult(null);

    try {
      const result = await mintTokensContractAsync({
        functionName: "mint",
        args: [formData.toAddress, formData.mintAmount],
      });
      //reducir el tamaño de result solo los 5 caracteres iniciales y los 5 ultims
      let resultf = result ? result.substring(0, 5) + "..." + result.substring(result.length - 5): "";
      setTransactionResult(result ? `Transacción exitosa: ${resultf}` : "Minting exitoso");
    } catch (e: any) {
      setTransactionError(e.message || "Error al ejecutar la transacción.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-5 w-full max-w-md">
      <h2 className="text-2xl font-bold text-primary-content mb-4">Mintear SFB Tokens</h2>
      <div className="flex flex-col space-y-4 w-full">
        <AddressInput
          placeholder="Dirección de destino"
          name="toAddress"
          value={formData.toAddress}
          onChange={value => handleInputChange("toAddress", value)}
        />
        <IntegerInput
          placeholder="Cantidad a Mintear"
          name="mintAmount"
          value={formData.mintAmount}
          onChange={value => handleInputChange("mintAmount", value as bigint)}
        />
        <button className="btn btn-primary w-full" onClick={handleMintTokensClick}>
          Mintear Tokens
        </button>
      </div>
      {transactionResult && (
        <div className="mt-4 bg-green-500 text-white rounded-lg p-3 text-center max-w-md">
          {transactionResult}
        </div>
      )}
      {transactionError && (
        <div className="mt-4 bg-red-500 text-white rounded-lg p-3 text-center">
          Error: {transactionError}
        </div>
      )}
    </div>
  );
}
