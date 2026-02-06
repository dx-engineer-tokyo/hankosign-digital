import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; icon: ReactNode }> = {
  error: {
    container: 'border-red-200 bg-red-50 text-red-700',
    icon: <XCircle className="h-5 w-5 flex-shrink-0" />,
  },
  success: {
    container: 'border-green-200 bg-green-50 text-green-700',
    icon: <CheckCircle2 className="h-5 w-5 flex-shrink-0" />,
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 text-amber-700',
    icon: <AlertCircle className="h-5 w-5 flex-shrink-0" />,
  },
  info: {
    container: 'border-blue-200 bg-blue-50 text-blue-700',
    icon: <Info className="h-5 w-5 flex-shrink-0" />,
  },
};

export default function Alert({ variant, children, className = '' }: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`border rounded-md px-4 py-3 flex items-start gap-3 ${styles.container} ${className}`}>
      {styles.icon}
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}
