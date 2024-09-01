"use client";

interface JoinRoomButtonProps {
  isActive: boolean;
  handleJoinRoom: () => void;
}

export const JoinRoomButton = ({ isActive, handleJoinRoom }: JoinRoomButtonProps) => {
  if (!isActive) return null;

  return (
    <button className="btn btn-primary btn-lg mt-6" onClick={handleJoinRoom}>
      Unirse al Cuarto
    </button>
  );
};
