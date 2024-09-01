"use client";

interface RoomDataProps {
  roomId: bigint;
  roomData: any;
  formatBetAmount: (betAmount: bigint) => string;
}

export const RoomData = ({ roomId, roomData, formatBetAmount }: RoomDataProps) => {
  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-5 text-primary-content">
      <h2 className="text-2xl font-bold">Datos de la Sala</h2>
      <p className="mt-4">
        <strong>ID de la Sala:</strong> {roomId.toString()}
      </p>
      <p>
        <strong>Jugador 1:</strong> {roomData.player1.playerAddress || "No asignado"}
      </p>
      <p>
        <strong>Jugador 2:</strong> {roomData.player2.playerAddress || "No asignado"}
      </p>
      <p>
        <strong>Apuesta:</strong> {formatBetAmount(roomData.betAmount)} SFB
      </p>
    </div>
  );
};
