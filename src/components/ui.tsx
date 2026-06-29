import React from 'react';
import { cn } from '../lib/utils';
import { Camera } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className, ...props }: CardProps) => (
  <div className={cn("bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className, ...props }: CardProps) => (
  <div className={cn("px-6 py-4 border-b border-slate-100 dark:border-slate-800", className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({ children, className, ...props }: CardProps) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
      secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
      outline: 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
      icon: 'p-2',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

export const Badge = ({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'outline' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
    secondary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    outline: 'border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-400',
  };
  
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const StatsCard = ({ title, value, icon: Icon, trend, color = 'indigo', className }: { title: string, value: string | number, icon: any, trend?: { value: string, positive: boolean }, color?: string, className?: string }) => {
  const colorStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    blue: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
  };

  return (
    <Card className={cn("hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors", className)}>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {trend && (
            <p className={cn("text-xs mt-2 flex items-center gap-1 font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>
              {trend.positive ? '+' : '-'}{trend.value}
              <span className="text-slate-400">from last week</span>
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", colorStyles[color as keyof typeof colorStyles])}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
};

export const Table = ({ headers, children }: { headers: string[], children: React.ReactNode }) => (
  <div className="overflow-x-auto custom-scrollbar">
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          {headers.map((header) => (
            <th key={header} className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {children}
      </tbody>
    </table>
  </div>
);

export const FileUpload = ({ 
  label, 
  value, 
  onChange, 
  icon: Icon = Camera,
  className 
}: { 
  label: string, 
  value?: string, 
  onChange: (file: File | null) => void,
  icon?: any,
  className?: string 
}) => {
  const [preview, setPreview] = React.useState<string | null>(value || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden",
          preview ? "border-indigo-500 bg-indigo-50/10" : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500"
        )}
      >
        {preview ? (
          <>
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Change Photo</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Icon className="w-8 h-8" />
            <span className="text-[10px] font-black uppercase tracking-widest">Upload Photo</span>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden" 
        />
      </div>
    </div>
  );
};
