import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-center touch-manipulation min-h-[48px]";
  
  const variants = {
    primary: "bg-brand-gold text-brand-text hover:bg-yellow-600 border border-transparent",
    secondary: "bg-brand-accent text-white hover:bg-brand-accentLight border border-transparent",
    danger: "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200",
    ghost: "bg-transparent text-brand-textSec hover:bg-gray-200 border border-gray-300"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};