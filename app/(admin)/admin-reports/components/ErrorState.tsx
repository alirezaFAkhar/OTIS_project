interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="text-center py-8 sm:py-12 text-red-600 text-sm sm:text-base">
      {message}
    </div>
  );
}

