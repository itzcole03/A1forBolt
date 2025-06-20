import React, { useState } from 'react';



interface BettingOpportunity {
    id: string;
    description: string;
    odds: number;
    confidence: number;
    expectedValue: number;
    kellySize: number;
    models: string[];
}

interface UltimateMoneyMakerProps {
    // predictions: Prediction[]; // Removed unused predictions prop
    opportunities: BettingOpportunity[];
    onPlaceBet: (opportunity: BettingOpportunity) => Promise<void>;
}

export const UltimateMoneyMaker: React.FC<Omit<UltimateMoneyMakerProps, 'predictions'>> = ({
    opportunities,
    onPlaceBet
}) => {
    const [isPlacingBet, setIsPlacingBet] = useState(false);

    const handlePlaceBet = async (opportunity: BettingOpportunity) => {
        try {
            setIsPlacingBet(true);
            await onPlaceBet(opportunity);

        } catch (error) {
            console.error('Error placing bet:', error);
        } finally {
            setIsPlacingBet(false);
        }
    };

    return (
        <div className="ultimate-money-maker">
            <h2 className="text-2xl font-bold mb-4">Betting Opportunities</h2>

            <div className="space-y-4">
                {opportunities.map(opportunity => (
                    <div 
                        key={opportunity.id}
                        className="prizepicks-card p-4 rounded-xl"

                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold">{opportunity.description}</h3>
                                <p className="text-sm text-gray-500">
                                    Models: {opportunity.models.join(', ')}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold">
                                    {(opportunity.confidence * 100).toFixed(1)}%
                                </div>
                                <div className="text-sm">Confidence</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="glass-premium p-2 rounded-lg">
                                <div className="text-sm text-gray-500">Odds</div>
                                <div className="font-bold">{opportunity.odds.toFixed(2)}</div>
                            </div>
                            <div className="glass-premium p-2 rounded-lg">
                                <div className="text-sm text-gray-500">Expected Value</div>
                                <div className="font-bold">{(opportunity.expectedValue * 100).toFixed(1)}%</div>
                            </div>
                            <div className="glass-premium p-2 rounded-lg">
                                <div className="text-sm text-gray-500">Kelly Size</div>
                                <div className="font-bold">{(opportunity.kellySize * 100).toFixed(1)}%</div>
                            </div>
                        </div>

                        <button
                            className="ultimate-btn w-full mt-4"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePlaceBet(opportunity);
                            }}
                            disabled={isPlacingBet}
                        >
                            {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
