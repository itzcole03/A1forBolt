import { PrizePicksProjection } from '../api/PrizePicksAPI';



interface WorkerMessage {
  type: 'GENERATE_COMBINATIONS';
  data: {
    projections: PrizePicksProjection[];
    maxLegs: number;
  };
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  if (event.data.type === 'GENERATE_COMBINATIONS') {
    const { projections, maxLegs } = event.data.data;
    const combinations = generateCombinations(projections, maxLegs);
    self.postMessage({ type: 'COMBINATIONS_READY', data: combinations });
  }
};

function generateCombinations(
  projections: PrizePicksProjection[],
  maxLegs: number
): PrizePicksProjection[][] {
  const results: PrizePicksProjection[][] = [];
  const batchSize = 1000;
  let batchCount = 0;
  
  const combine = (current: PrizePicksProjection[], start: number, legsLeft: number) => {
    if (legsLeft === 0) {
      results.push([...current]);
      batchCount++;
      
      // Send progress updates every 1000 combinations
      if (batchCount % batchSize === 0) {
        self.postMessage({
          type: 'PROGRESS_UPDATE',
          data: {
            combinationsGenerated: batchCount,
            isComplete: false
          }
        });
      }
      return;
    }
    
    for (let i = start; i < projections.length; i++) {
      current.push(projections[i]);
      combine(current, i + 1, legsLeft - 1);
      current.pop();
    }
  };

  // Generate combinations for each number of legs
  for (let legs = 2; legs <= maxLegs; legs++) {
    combine([], 0, legs);
  }

  // Send final progress update
  self.postMessage({
    type: 'PROGRESS_UPDATE',
    data: {
      combinationsGenerated: results.length,
      isComplete: true
    }
  });

  return results;
} 