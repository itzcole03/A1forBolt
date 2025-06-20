interface LoadingSpinnerProps {
  className?: string;
}

function LoadingSpinner({ className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center py-4 ${className}`}>
      <div className="w-6 h-6 border-2 border-primary rounded-full animate-spin border-t-transparent" />
    </div>
  );
}

export default LoadingSpinner;
