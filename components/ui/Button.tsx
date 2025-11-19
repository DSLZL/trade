import React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  variants: {
    default: 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 border border-brand-blue/50',
    destructive: 'bg-brand-red text-white hover:bg-brand-red/90 shadow-lg shadow-brand-red/20',
    outline: 'border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-100',
    secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700',
    ghost: 'hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400',
    link: 'text-brand-blue underline-offset-4 hover:underline',
  },
  sizes: {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 rounded-md px-3 text-xs',
    lg: 'h-12 rounded-lg px-8 text-base',
    icon: 'h-10 w-10',
  }
};

type Variant = keyof typeof buttonVariants['variants'];
type Size = keyof typeof buttonVariants['sizes'];

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:grayscale',
          buttonVariants.variants[variant],
          buttonVariants.sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export default Button;