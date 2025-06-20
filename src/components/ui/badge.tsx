import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "primary" | "secondary" | "success" | "warning" | "danger" | string;
    children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
    primary: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ variant = "primary", className = "", children, ...props }, ref) => (
        <span
            ref={ref}
            className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold align-middle select-none ${variantClasses[variant] || variantClasses.primary
                } ${className}`}
            {...props}
        >
            {children}
        </span>
    )
);
Badge.displayName = "Badge";
