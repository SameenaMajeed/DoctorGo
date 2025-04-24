import React from 'react';
import { cn } from '../../Utils/Utils'; // a common Tailwind `className` merge utility

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
}

export const Button = ({ className, variant = 'default', ...props }: ButtonProps) => {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md text-black bg-blue-600 hover:bg-blue-700',
        variant === 'outline' && 'bg-transparent border border-gray-300 text-gray-700',
        className
      )}
      {...props}
    />
  );
};
