import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
  onClick?: any;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-cyan-500/80 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] backdrop-blur-md border border-cyan-400/30',
    secondary: 'glass-panel text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-white border-transparent',
    danger: 'bg-red-500/80 text-white border border-red-400/30'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-4 text-base'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
