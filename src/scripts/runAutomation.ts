import { BettingAutomationService } from '../services/automation/BettingAutomationService';
import { defaultConfig } from '../config/automation.config';
import { notificationService } from '../services/notification';

async function main() {
  try {
    const automationService = BettingAutomationService.getInstance();

    // Set up process handlers
    process.on('SIGINT', async () => {
      console.log('\nGracefully shutting down...');
      await automationService.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM. Shutting down...');
      await automationService.stop();
      process.exit(0);
    });

    process.on('uncaughtException', async error => {
      console.error('Uncaught Exception:', error);
      notificationService.notify('error', 'Uncaught Exception', { error });
      await automationService.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      notificationService.notify('error', 'Unhandled Rejection', { reason });
      await automationService.stop();
      process.exit(1);
    });

    // Start the automation
    console.log('Starting betting automation...');
    await automationService.start();

    // Log startup success
    console.log('Betting automation started successfully');
    notificationService.notify('success', 'Betting automation started successfully');
  } catch (error) {
    console.error('Failed to start betting automation:', error);
    process.exit(1);
  }
}

// Run the automation
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
