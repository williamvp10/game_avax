"use client";

import { IntegerInput } from "~~/components/scaffold-eth";

interface RoomQueryFormProps {
  roomId: bigint;
  handleRoomIdChange: (value: bigint) => void;
  handleFetchRoomData: () => void;
}

export const RoomQueryForm = ({ roomId, handleRoomIdChange, handleFetchRoomData }: RoomQueryFormProps) => {
  return (
    <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 p-5 text-primary">
      <h2 className="text-2xl font-bold text-primary-content">Consultar Sala</h2>
      <div className="flex flex-col gap-4 mt-4">
        <IntegerInput
          placeholder="ID de la Sala"
          name="roomId"
          value={roomId}
          onChange={(value: string | bigint) => handleRoomIdChange(value as bigint)}
        />
        <button className="btn btn-primary btn-lg" onClick={handleFetchRoomData}>
          Consultar Sala
        </button>
      </div>
    </div>
  );
};
