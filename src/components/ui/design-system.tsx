import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Button Component with CVA variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 shadow-brandShadow hover:shadow-lg transform hover:scale-[1.02]",
        premium:
          "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-brandShadow hover:shadow-xl transform hover:scale-105 active:scale-95",
        glass:
          "bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-white/30 hover:border-white/40 shadow-glass",
        outline:
          "bg-transparent border-2 border-brand-500 text-brand-500 hover:bg-brand-500 hover:text-white shadow-soft hover:shadow-brandShadow",
        success:
          "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-successShadow",
        error:
          "bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 shadow-errorShadow",
        warning:
          "bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 shadow-warningShadow",
        ghost:
          "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
        link: "text-brand-500 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-10 py-5 text-xl",
        icon: "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// Card Component with variants
const cardVariants = cva("rounded-xl transition-all duration-300 ease-out", {
  variants: {
    variant: {
      default:
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-soft",
      premium:
        "bg-white/95 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl hover:border-brand-500/30 transform hover:-translate-y-2",
      glass:
        "bg-white/10 backdrop-blur-xl border border-white/20 shadow-glass hover:bg-white/20 hover:border-white/30 transform hover:translate-y-[-2px]",
      gradient:
        "bg-gradient-to-br from-brand-500/10 via-brand-600/5 to-brand-700/10 backdrop-blur-xl border border-brand-500/20 shadow-brandShadow",
      neumorphic:
        "bg-gray-100 dark:bg-gray-900 shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] dark:shadow-[20px_20px_60px_#0a0a0a,-20px_-20px_60px_#262626]",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      default: "p-6",
      lg: "p-8",
      xl: "p-10",
    },
    rounded: {
      default: "rounded-xl",
      lg: "rounded-2xl",
      xl: "rounded-3xl",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
    rounded: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, rounded, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, rounded, className }))}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

// Badge Component
const badgeVariants = cva(
  "inline-flex items-center font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
        premium:
          "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-sm",
        success:
          "bg-gradient-to-r from-success-500 to-success-600 text-white shadow-sm",
        error:
          "bg-gradient-to-r from-error-500 to-error-600 text-white shadow-sm",
        warning:
          "bg-gradient-to-r from-warning-500 to-warning-600 text-white shadow-sm",
        glass: "bg-white/20 backdrop-blur-lg border border-white/30 text-white",
        outline:
          "border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300",
      },
      size: {
        default: "px-3 py-1 text-sm rounded-full",
        sm: "px-2 py-0.5 text-xs rounded-full",
        lg: "px-4 py-2 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Badge.displayName = "Badge";

// Input Component
const inputVariants = cva(
  "flex w-full transition-all duration-300 ease-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20",
        premium:
          "bg-white/90 backdrop-blur-lg border border-gray-200 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20",
        glass:
          "bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/60 focus:border-white/40 focus:bg-white/20",
        minimal:
          "bg-transparent border-b-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-brand-500 rounded-none px-0",
      },
      inputSize: {
        default: "h-12 px-4 py-3 text-base",
        sm: "h-9 px-3 py-2 text-sm",
        lg: "h-14 px-6 py-4 text-lg",
      },
      rounded: {
        default: "rounded-xl",
        lg: "rounded-2xl",
        full: "rounded-full",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
      rounded: "default",
    },
  },
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, rounded, ...props }, ref) => {
    return (
      <input
        className={cn(
          inputVariants({ variant, inputSize, rounded, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

// Progress Component
const progressVariants = cva(
  "w-full overflow-hidden transition-all duration-500",
  {
    variants: {
      variant: {
        default: "bg-gray-200 dark:bg-gray-700",
        glass: "bg-white/20 backdrop-blur-lg",
        premium: "bg-gray-200 dark:bg-gray-700",
      },
      size: {
        default: "h-2",
        sm: "h-1",
        lg: "h-3",
        xl: "h-4",
      },
      rounded: {
        default: "rounded-full",
        lg: "rounded-xl",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
);

const progressFillVariants = cva(
  "h-full transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-brand-500",
        success: "bg-gradient-to-r from-success-500 to-success-600",
        error: "bg-gradient-to-r from-error-500 to-error-600",
        warning: "bg-gradient-to-r from-warning-500 to-warning-600",
        glass: "bg-white/80",
      },
      rounded: {
        default: "rounded-full",
        lg: "rounded-xl",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      rounded: "default",
    },
  },
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  fillVariant?: VariantProps<typeof progressFillVariants>["variant"];
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      value = 0,
      max = 100,
      fillVariant = "default",
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(progressVariants({ variant, size, rounded, className }))}
        {...props}
      >
        <div
          className={cn(
            progressFillVariants({ variant: fillVariant, rounded }),
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  },
);
Progress.displayName = "Progress";

// Loading Spinner Component
const spinnerVariants = cva("animate-spin rounded-full border-solid", {
  variants: {
    variant: {
      default: "border-gray-200 border-t-brand-500",
      brand: "border-brand-200 border-t-brand-500",
      success: "border-success-200 border-t-success-500",
      error: "border-error-200 border-t-error-500",
      white: "border-white/20 border-t-white",
    },
    size: {
      default: "h-8 w-8 border-4",
      sm: "h-5 w-5 border-2",
      lg: "h-12 w-12 border-4",
      xl: "h-16 w-16 border-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Spinner.displayName = "Spinner";

// Skeleton Component for loading states
const skeletonVariants = cva("animate-pulse bg-gray-200 dark:bg-gray-700", {
  variants: {
    variant: {
      default: "rounded",
      text: "rounded h-4",
      avatar: "rounded-full",
      button: "rounded-xl h-12",
      card: "rounded-xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, className }))}
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";

// Export all components
export {
  Button,
  buttonVariants,
  Card,
  cardVariants,
  Badge,
  badgeVariants,
  Input,
  inputVariants,
  Progress,
  progressVariants,
  Spinner,
  spinnerVariants,
  Skeleton,
  skeletonVariants,
};

// Export types
export type {
  ButtonProps,
  CardProps,
  BadgeProps,
  InputProps,
  ProgressProps,
  SpinnerProps,
  SkeletonProps,
};
