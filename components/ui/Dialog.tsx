import React, { ReactNode, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { cn } from '../../lib/utils';

interface DialogContextProps {
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextProps | null>(null);

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const handleOpenChange = useCallback((newOpenState: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpenState);
    }
  }, [onOpenChange]);

  const contextValue = useMemo(() => ({ onOpenChange: handleOpenChange }), [handleOpenChange]);
  
  if (!open) return null;

  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogPortal: React.FC<{ children: ReactNode }> = ({ children }) => {
  return ReactDOM.createPortal(children, document.body);
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = React.useContext(DialogContext);

    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          context?.onOpenChange(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [context]);

    return (
      <DialogPortal>
        {/* Wrapper for positioning and overlay */}
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          onClick={() => context?.onOpenChange(false)}
        >
          {/* Actual overlay background */}
          <div className="absolute inset-0 bg-black/80" />

          {/* The content box */}
          <div
            ref={ref}
            className={cn(
              "relative grid w-full max-w-lg gap-4 bg-background p-6 shadow-lg duration-200",
              // Mobile: bottom sheet appearance
              "rounded-t-lg border-t",
              // Desktop: centered modal appearance
              "sm:rounded-lg sm:border",
              className
            )}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {children}
            <button
              onClick={() => context?.onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      </DialogPortal>
    );
  }
);
DialogContent.displayName = "DialogContent";

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
};