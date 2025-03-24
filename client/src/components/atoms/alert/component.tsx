import { AlertCircle } from 'lucide-react';

interface AlertProps {
  message: string;
}

export function Alert({ message }: AlertProps) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-red-100 p-2 text-sm text-red-800">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
