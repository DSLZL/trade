
"use client";

import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  wrapperClassName?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, className, position = 'top', wrapperClassName }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    // Clear any existing timeout to prevent multiple triggers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Set a new timeout to show the tooltip after 1 second
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 1000); // 1000ms = 1 second
  };

  const handleMouseLeave = () => {
    // Clear the timeout if the mouse leaves before it fires
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Hide the tooltip immediately
    setIsVisible(false);
  };
  
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={cn("relative inline-flex items-center", wrapperClassName)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {text && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-md',
            'transition-opacity duration-200 pointer-events-none',
            isVisible ? 'opacity-100' : 'opacity-0', // Control visibility with state
            positionClasses[position],
            className
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export { Tooltip };
