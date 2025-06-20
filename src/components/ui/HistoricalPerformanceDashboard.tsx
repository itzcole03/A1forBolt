// HistoricalPerformanceDashboard.tsx
// Visualizes user/model historical performance

import React from 'react';
import { useBetHistoryStore } from '../../store/slices/betHistorySlice';

export const HistoricalPerformanceDashboard: React.FC = () => {
  const userHistory = useBetHistoryStore((s) => s.userHistory);
  const modelHistory = useBetHistoryStore((s) => s.modelHistory);

  return (
    <section className="w-full p-4 bg-white shadow rounded mb-4">
      <h3 className="text-md font-bold mb-2">Historical Performance</h3>
      {userHistory && userHistory.entries.length > 0 ? (
        <div>
          <h4 className="font-semibold mb-1">Your Bet History</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Event</th>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">Stake</th>
                  <th className="px-2 py-1">Odds</th>
                  <th className="px-2 py-1">Result</th>
                  <th className="px-2 py-1">Payout</th>
                  <th className="px-2 py-1">Confidence</th>
                  <th className="px-2 py-1">Win Prob</th>
                </tr>
              </thead>
              <tbody>
                {userHistory.entries.map((entry) => (
                  <tr key={entry.betId} className="border-b">
                    <td className="px-2 py-1">{entry.date}</td>
                    <td className="px-2 py-1">{entry.eventId}</td>
                    <td className="px-2 py-1">{entry.betType}</td>
                    <td className="px-2 py-1">${entry.stake.toFixed(2)}</td>
                    <td className="px-2 py-1">{entry.odds.toFixed(2)}</td>
                    <td className="px-2 py-1">{entry.result}</td>
                    <td className="px-2 py-1">${entry.payout.toFixed(2)}</td>
                    <td className="px-2 py-1">[{entry.confidenceBand.lower.toFixed(2)} - {entry.confidenceBand.upper.toFixed(2)}]</td>
                    <td className="px-2 py-1">{(entry.winProbability.probability * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-gray-400">No user bet history available.</div>
      )}
      {modelHistory && modelHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-1">Model Performance</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1">Model</th>
                  <th className="px-2 py-1">Market</th>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Prediction</th>
                  <th className="px-2 py-1">Actual</th>
                  <th className="px-2 py-1">Won?</th>
                  <th className="px-2 py-1">Payout</th>
                  <th className="px-2 py-1">Confidence</th>
                  <th className="px-2 py-1">Win Prob</th>
                </tr>
              </thead>
              <tbody>
                {modelHistory.flatMap((mh) =>
                  mh.entries.map((entry, idx) => (
                    <tr key={mh.model + mh.market + idx} className="border-b">
                      <td className="px-2 py-1">{mh.model}</td>
                      <td className="px-2 py-1">{mh.market}</td>
                      <td className="px-2 py-1">{entry.date}</td>
                      <td className="px-2 py-1">{entry.prediction.toFixed(2)}</td>
                      <td className="px-2 py-1">{entry.actual.toFixed(2)}</td>
                      <td className="px-2 py-1">{entry.won ? 'Yes' : 'No'}</td>
                      <td className="px-2 py-1">${entry.payout.toFixed(2)}</td>
                      <td className="px-2 py-1">[{entry.confidenceBand.lower.toFixed(2)} - {entry.confidenceBand.upper.toFixed(2)}]</td>
                      <td className="px-2 py-1">{(entry.winProbability.probability * 100).toFixed(1)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
