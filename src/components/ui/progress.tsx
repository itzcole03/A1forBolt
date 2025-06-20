import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number; // 0-100
    color?: string;
    className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, color = "#3b82f6", className = "", ...props }) => {
    return (
        <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`} {...props}>
            <div
                className="h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }}
            />
        </div>
    );
};
