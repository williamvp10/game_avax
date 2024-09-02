"use client";

import { PresentationChartBarIcon, TrophyIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface RoomDataProps {
  roomId: bigint;
  roomData: any;
  formatBetAmount: (betAmount: bigint) => string;
}

export const RoomData = ({ roomId, roomData, formatBetAmount }: RoomDataProps) => {
  // Función para formatear direcciones largas
  const formatAddress = (address: string) => {
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
  };

  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-6 text-primary-content space-y-8">
      {/* Sección de Datos Generales del Juego */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Datos Generales del Juego</h2>
        <div className="flex justify-between items-center">
          <p className="flex items-center">
            <PresentationChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
            <strong>ID de la Sala:</strong> {roomId.toString()}
          </p>
          <p className="flex items-center">
            <PresentationChartBarIcon className="h-6 w-6 text-green-500 mr-2" />
            <strong>Estado del Juego:</strong> {roomData.isActive ? "En progreso" : "Finalizado"}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <p className="flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <strong>Apuesta por Persona:</strong> {formatBetAmount(roomData.betAmount)} SFB
          </p>
          <p className="flex items-center flex-row">
            <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
            <strong>Ganador:</strong> {roomData.winner !== "0x0000000000000000000000000000000000000000" ? formatAddress(roomData.winner) : "Ninguno"}
          </p>
        </div>
        <div className="flex justify-between items-center">
          <p>
            <strong>Apuesta Pagada:</strong> {roomData.betPaid ? "Sí" : "No"}
          </p>
          <p className="flex items-center">
            <UserIcon className="h-6 w-6 text-gray-500 mr-2" />
            <strong>Propietario del Mapa:</strong> {formatAddress(roomData.mapOwner) || "No asignado"}
          </p>
        </div>
      </div>

      {/* Sección de Estadísticas de los Jugadores */}
      <div className="flex justify-between space-x-4">
        {/* Estadísticas del Jugador 1 */}
        <div className="bg-secondary rounded-3xl shadow-md p-5 w-1/2">
          <h3 className="text-xl font-bold text-center text-primary">Jugador 1</h3>
          <p className="mt-4">
            <UserIcon className="h-5 w-5 text-gray-500 mr-2 inline" />
            <strong>Dirección:</strong> {formatAddress(roomData.player1.playerAddress) || "No asignado"}
          </p>
          <p>
            <PresentationChartBarIcon className="h-5 w-5 text-blue-500 mr-2 inline" />
            <strong>Puntos:</strong> {roomData.player1.points.toString()}
          </p>
          <p>
            <PresentationChartBarIcon className="h-5 w-5 text-blue-500 mr-2 inline" />
            <strong>Torres Restantes:</strong> {roomData.player1.towersLeft.toString()}
          </p>
        </div>

        {/* Estadísticas del Jugador 2 */}
        <div className="bg-secondary rounded-3xl shadow-md p-5 w-1/2">
          <h3 className="text-xl font-bold text-center text-primary">Jugador 2</h3>
          <p className="mt-4">
            <UserIcon className="h-5 w-5 text-gray-500 mr-2 inline" />
            <strong>Dirección:</strong> {formatAddress(roomData.player2.playerAddress) || "No asignado"}
          </p>
          <p>
            <PresentationChartBarIcon className="h-5 w-5 text-blue-500 mr-2 inline" />
            <strong>Puntos:</strong> {roomData.player2.points.toString()}
          </p>
          <p>
            <PresentationChartBarIcon className="h-5 w-5 text-blue-500 mr-2 inline" />
            <strong>Torres Restantes:</strong> {roomData.player2.towersLeft.toString()}
          </p>
        </div>
      </div>
    </div>
  );
};
