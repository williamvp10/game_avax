"use client";

interface ErrorMessageProps {
  transactionError: string | null;
}

export const ErrorMessage = ({ transactionError }: ErrorMessageProps) => {
  if (!transactionError) return null;

  return (
    <div className="bg-red-500 text-white rounded-3xl text-sm px-4 py-2">
      <p className="font-bold m-0 mb-1">Error:</p>
      <pre className="whitespace-pre-wrap break-words">{transactionError}</pre>
    </div>
  );
};
