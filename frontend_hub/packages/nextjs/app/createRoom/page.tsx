import { CreateRoomForm } from "./_components/CreateRoomForm"; // Importa el componente
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Sea of Fortune - Crear Cuarto",
  description: "Crea un nuevo cuarto en el juego de batalla Sea of Fortune",
});

const SeaOfFortune: NextPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary text-white">
      <h1 className="text-5xl font-bold my-10 text-primary">Sea of Fortune</h1>
      <p className="text-lg mb-8 text-primary-content">
        ¡Crea un nuevo cuarto y comienza tu batalla en Sea of Fortune! Establece la cantidad de la apuesta y selecciona al dueño del mapa.
      </p>
      <div className="w-full max-w-lg">
        <CreateRoomForm /> {/* Utiliza el componente que creaste */}
      </div>
      <div className="mt-10 text-center">
        <p className="text-primary-content">
          Interactúa con la blockchain directamente para crear cuartos de juego.
          <br />
          ¡Administra la configuración de tu juego y prepárate para la batalla!
        </p>
      </div>
    </div>
  );
};

export default SeaOfFortune;
