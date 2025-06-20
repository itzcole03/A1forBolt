import { useState, useEffect } from 'react';

export default function useConfidenceStats(props) {
  const [stats, setStats] = useState({ average: 0, countAboveThreshold: 0 });

  useEffect(() => {
    if (!props || props.length === 0) return;

    const avg = props.reduce((sum, p) => sum + p.confidence, 0) / props.length;
    const count = props.filter((p) => p.confidence > 0.75).length;

    setStats({ average: avg, countAboveThreshold: count });
  }, [props]);

  return stats;
}