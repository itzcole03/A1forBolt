import 'reflect-metadata';
import { dataScrapingService } from '../services/dataScrapingService.ts';

async function main() {
  try {
    const data = await dataScrapingService.fetchDailyFantasyProjections(new Date().toISOString().slice(0, 10));
    if (data.length > 0) {
      console.log('Sample player data:', data.slice(0, 3));
    } else {
      console.log('No player data found.');
    }
  } catch (error) {
    console.error('Error running data update:', error);
  }
}

main();