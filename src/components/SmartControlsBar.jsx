import React, { useState } from 'react';

const SmartControlsBar = () => {
  const [sport, setSport] = useState('NBA');
  const [legs, setLegs] = useState(3);
  const [confidence, setConfidence] = useState(0.7);
  const [useSentiment, setUseSentiment] = useState(true);
  const [useVolatility, setUseVolatility] = useState(true);
  const [entryAmount, setEntryAmount] = useState(10);

  const payoutTable = { 2: 3, 3: 5, 4: 10, 5: 20, 6: 30 };
  const payout = payoutTable[legs] * entryAmount || 0;

  return (
    <div className="p-4 mb-4 border rounded-md bg-white shadow-md grid gap-4 md:grid-cols-2">
      <div className="flex flex-wrap gap-4 items-center">
        <label className="font-medium">Legs:
          <select value={legs} onChange={(e) => setLegs(parseInt(e.target.value))} className="ml-2 p-1 border rounded">
            {[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        <label className="font-medium">Sport:
          <select value={sport} onChange={(e) => setSport(e.target.value)} className="ml-2 p-1 border rounded">
            {["NBA", "WNBA", "MLB", "NHL", "Soccer"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="font-medium">Confidence ≥ {Math.round(confidence * 100)}%
          <input type="range" min="0.5" max="1" step="0.01" value={confidence} onChange={(e) => setConfidence(parseFloat(e.target.value))} className="ml-2" />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={useSentiment} onChange={() => setUseSentiment(!useSentiment)} />
          Social Sentiment
        </label>

        <label className="flex items-center gap-1">
          <input type="checkbox" checked={useVolatility} onChange={() => setUseVolatility(!useVolatility)} />
          Volatility
        </label>

        <label className="font-medium">Entry: $
          <input type="number" value={entryAmount} min={1} onChange={(e) => setEntryAmount(Number(e.target.value))} className="ml-1 w-16 p-1 border rounded" />
        </label>

        <span className="font-bold text-green-600">Payout: ${payout.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default SmartControlsBar;