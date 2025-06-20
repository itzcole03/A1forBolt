
interface SportSelectorProps {
    selectedSport: string;
    onSportChange: (sport: string) => void;
    label?: string;
}

import { SPORT_OPTIONS } from "../../constants/sports";

export function SportSelector({ selectedSport, onSportChange, label }: SportSelectorProps) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <select
                value={selectedSport}
                onChange={(e) => onSportChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                title={label || "Sport"}
            >
                {SPORT_OPTIONS.map((sport) => (
                    <option key={sport} value={sport}>
                        {sport}
                    </option>
                ))}
            </select>
        </div>
    );
}
