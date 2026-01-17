import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  icon, 
  children, 
  className = '', 
  fullWidth = false,
  disabled,
  ...props 
}) => {
  const baseStyles = "rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-sage-900 text-white hover:bg-sage-800 shadow-lg shadow-sage-900/10",
    secondary: "bg-sage-100 text-sage-800 hover:bg-sage-200 border border-transparent",
    outline: "border-2 border-sage-200 text-sage-700 hover:border-sage-300 hover:bg-sage-50",
    ghost: "text-sage-600 hover:bg-sage-50 bg-transparent",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-3 text-sm",
    lg: "px-8 py-4 text-lg"
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <i className="fas fa-spinner fa-spin animate-spin"></i>}
      {!isLoading && icon && <i className={`fas ${icon}`}></i>}
      {children}
    </button>
  );
};