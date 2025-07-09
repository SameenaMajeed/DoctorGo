import React from 'react';
import { cn } from '../../Utils/Utils'; // a common Tailwind `className` merge utility

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | "destructive";
  size?: 'sm' | 'md' | 'lg'; 
}

export const Button = ({ className, variant = 'default', size = 'md', ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md text-black bg-blue-600 hover:bg-blue-700',
        variant === 'outline' && 'bg-transparent border border-gray-300 text-gray-700',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'md' && 'px-4 py-2',
        size === 'lg' && 'px-6 py-3 text-lg',
        className
      )}
      {...props}
    />
  );
};
