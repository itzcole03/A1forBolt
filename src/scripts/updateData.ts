import 'reflect-metadata';
import { DataScrapingService } from '../services/dataScrapingService';

async function main() {
  try {
    const service = DataScrapingService.getInstance();

    const data = await service.fetchPlayerData();

    // Log some sample data
    if (data.length > 0) {
    }
  } catch (error) {
    console.error('Error running data update:', error);
  }
}

main();
