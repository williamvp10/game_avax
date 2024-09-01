import { MintTokensForm } from "./_components/MintTokensForm";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Sea of Fortune - Crear Cuarto",
  description: "Crea un nuevo cuarto en el juego de batalla Sea of Fortune",
});

const MintTokenPage: NextPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary text-white">
      <MintTokensForm />
    </div>
  );
};

export default MintTokenPage;
