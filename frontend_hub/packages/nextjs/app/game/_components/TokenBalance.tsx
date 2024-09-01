"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function TokenBalance() {
  const { address: connectedAddress } = useAccount();
  const [balance, setBalance] = useState<string>("0");

  // Hook para leer el balance del contrato CrossChainToken
  const { data: tokenBalance } = useScaffoldReadContract({
    contractName: "CrossChainToken",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  useEffect(() => {
    if (tokenBalance) {
      setBalance(tokenBalance.toString());
    }
  }, [tokenBalance]);

  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-5 mb-6 w-full max-w-sm">
      <h2 className="text-2xl font-bold text-primary-content">Tu Balance de SFB Tokens</h2>
      <p className="mt-4 text-primary">
        <strong>Balance:</strong> {balance} SFB
      </p>
    </div>
  );
}
