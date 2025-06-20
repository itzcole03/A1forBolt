import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';


const BetSlipSidebar: React.FC = () => {
  const {
    legs,
    removeLeg,
    clearSlip,
    updateStake,
    stake,
    potentialPayout,
    isSubmitting,
    submitSlip,
    addToast,
  } = useAppStore(state => ({
    legs: state.legs,
    removeLeg: state.removeLeg,
    clearSlip: state.clearSlip,
    updateStake: state.updateStake,
    stake: state.stake,
    potentialPayout: state.potentialPayout,
    isSubmitting: state.isSubmitting,
    submitSlip: state.submitSlip,
    addToast: state.addToast,
  }));
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSubmit = async () => {
    if (legs.length < 2) {
      addToast({ message: 'Select at least 2 picks to submit a bet.', type: 'warning' });
      return;
    }
    if (stake <= 0) {
      addToast({ message: 'Please enter a valid stake amount.', type: 'warning' });
      return;
    }
    const result = await submitSlip();
    if (result) {
      setIsMobileOpen(false);
    }
  };

  // Mobile toggle button
  const MobileToggle = () => (
    <button
      className="fixed bottom-6 right-6 z-[101] p-4 rounded-full bg-gradient-to-br from-primary-700 to-primary-500 text-white shadow-2xl lg:hidden animate-bounce-subtle"
      onClick={() => setIsMobileOpen(true)}
      aria-label="Open Bet Slip"
    >
      🧾
    </button>
  );

  // Main betslip content
  const BetSlipContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">Bet Slip</h2>
        <button
          className="p-2 rounded-full text-white hover:bg-primary/20 transition-colors"
          onClick={() => (setIsMobileOpen(false))}
          aria-label="Close bet slip"
        >
          <X size={26} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {legs.length === 0 ? (
          <div className="text-center text-primary-100 py-12">
            <span className="text-4xl">🧾</span>
            <div className="mt-2 text-lg font-semibold">No picks yet</div>
            <div className="text-primary-200">Add player props to build your bet slip.</div>
          </div>
        ) : (
          legs.map((leg, idx) => (
            <div key={idx} className="glass rounded-xl p-4 flex items-center justify-between bg-gradient-to-r from-primary-700/30 to-primary-500/20">
              <div>
                <div className="font-bold text-white">{leg.playerName}</div>
                <div className="text-primary-200 text-sm">{leg.statType} {leg.pick.toUpperCase()} {leg.line}</div>
              </div>
              <button
                className="ml-4 p-2 rounded-full hover:bg-red-500/20 text-red-300"
                onClick={() => removeLeg(leg.propId, leg.pick)}
                aria-label="Remove pick"
              >
                <X size={20} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-primary-100 font-semibold">Entry Amount</span>
          <input
            type="number"
            min={1}
            max={10000}
            value={stake}
            onChange={e => updateStake(Number(e.target.value))}
            className="premium-input-container w-32 text-right text-lg font-bold text-primary-700 dark:text-primary-200"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-primary-100 font-semibold">Potential Payout</span>
          <span className="text-yellow-300 text-xl font-extrabold">${potentialPayout.toFixed(2)}</span>
        </div>
        <button
          className="w-full modern-button px-8 py-4 rounded-2xl text-lg font-bold bg-green-500 hover:bg-green-600 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={legs.length < 2 || stake <= 0 || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : legs.length < 2 ? 'Select 2+ Picks' : 'Submit Entry'}
        </button>
        {legs.length > 0 && (
          <button
            className="w-full mt-2 text-sm underline text-primary-200 hover:text-white"
            onClick={clearSlip}
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );

  // Desktop sidebar
  return (
    <>
      <div className="hidden lg:flex flex-col fixed top-0 right-0 h-full w-[380px] z-[100] p-6 bg-gradient-to-br from-primary-900/90 to-primary-700/80 glass shadow-2xl animate-fade-in">
        {BetSlipContent}
      </div>
      {/* Mobile floating button and modal */}
      <MobileToggle />
      {isMobileOpen && (
        <div className="fixed inset-0 z-[101] flex items-end justify-center bg-black/60 backdrop-blur-xl animate-fade-in lg:hidden">
          <div className="w-full max-w-md bg-gradient-to-br from-primary-900/90 to-primary-700/80 glass rounded-t-3xl shadow-2xl p-6">
            {BetSlipContent}
          </div>
        </div>
      )}
    </>
  );
};

export default BetSlipSidebar; 