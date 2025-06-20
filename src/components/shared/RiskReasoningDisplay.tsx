

interface RiskReasoningDisplayProps {
    riskReasoning?: string[];
    className?: string;
}

/**
 * Displays risk reasoning as a list with icons and severity styling.
 * Omits display if riskReasoning is empty or undefined.
 */
export function RiskReasoningDisplay({ riskReasoning, className = "" }: RiskReasoningDisplayProps) {
    if (!riskReasoning || riskReasoning.length === 0) return null;

    // Simple severity detection (can be improved)
    const getSeverity = (reason: string) => {
        if (/low|minor|no major/i.test(reason)) return "low";
        if (/high|critical|elevated|volatility|risk/i.test(reason)) return "high";
        return "medium";
    };

    const iconForSeverity = (severity: string) => {
        switch (severity) {
            case "high":
                return <span className="text-red-500 mr-1" title="High Risk">⚠️</span>;
            case "medium":
                return <span className="text-yellow-500 mr-1" title="Medium Risk">🧠</span>;
            case "low":
            default:
                return <span className="text-green-500 mr-1" title="Low Risk">🔍</span>;
        }
    };

    return (
        <div className={`risk-reasoning-display bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2 ${className}`}>
            <div className="font-semibold text-gray-700 dark:text-gray-200 mb-1 flex items-center">
                <span className="mr-2">Risk Reasoning</span>
                <span className="text-xs text-gray-400">({riskReasoning.length})</span>
            </div>
            <ul className="space-y-1">
                {riskReasoning.map((reason, idx) => {
                    const severity = getSeverity(reason);
                    return (
                        <li key={idx} className="flex items-start text-sm">
                            {iconForSeverity(severity)}
                            <span className={
                                severity === "high"
                                    ? "text-red-700 dark:text-red-400"
                                    : severity === "medium"
                                        ? "text-yellow-700 dark:text-yellow-400"
                                        : "text-green-700 dark:text-green-400"
                            }>{reason}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
