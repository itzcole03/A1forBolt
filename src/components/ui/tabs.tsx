import * as React from "react";

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children, ...props }) => (
    <div {...props}>{children}</div>
);

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children, ...props }) => (
    <div className="flex border-b mb-2" {...props}>{children}</div>
);

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    children: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ active, children, ...props }) => (
    <button
        className={`px-4 py-2 focus:outline-none border-b-2 transition-colors ${active ? 'border-blue-500 text-blue-700 font-semibold' : 'border-transparent text-gray-600'}`}
        {...props}
    >
        {children}
    </button>
);

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ children, ...props }) => (
    <div className="py-2" {...props}>{children}</div>
);
