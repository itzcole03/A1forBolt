import fs from 'fs';
const LOG_PATH = 'logs/liveData.log';

export function logLiveData(message: string) {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(LOG_PATH, logMsg);
  } catch (e) {
    // Fallback to console if file logging fails
    console.error('[LiveDataLogger]', logMsg);
  }
}
