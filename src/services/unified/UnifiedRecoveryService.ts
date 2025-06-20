import { UnifiedLogger } from './UnifiedLogger';
import { UnifiedSettingsService } from './UnifiedSettingsService';
import { UnifiedErrorService } from './UnifiedErrorService';
import { UnifiedBackupService } from './UnifiedBackupService';
import { UnifiedServiceRegistry } from '../unified/UnifiedServiceRegistry';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DatabaseConfig {
  postgres?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  redis?: {
    host: string;
    port: number;
    password: string;
  };
}

export interface RecoveryConfig {
  enabled: boolean;
  autoRecovery: boolean;
  maxRetries: number;
  retryDelay: number;
  backupVerification: boolean;
  healthCheckInterval: number;
}

export interface RecoveryResult {
  success: boolean;
  timestamp: number;
  component: string;
  action: string;
  error?: string;
  details?: any;
}

export class UnifiedRecoveryService {
  private static instance: UnifiedRecoveryService;
  private logger: UnifiedLogger;
  private settings: UnifiedSettingsService;
  private errorService: UnifiedErrorService;
  private backupService: UnifiedBackupService;
  private config: RecoveryConfig;
  private recoveryAttempts: Map<string, number>;

  private constructor(registry: UnifiedServiceRegistry) {
    this.logger = UnifiedLogger.getInstance();
    this.settings = UnifiedSettingsService.getInstance(registry);
    this.errorService = UnifiedErrorService.getInstance(registry);
    this.backupService = UnifiedBackupService.getInstance(registry);
    this.config = this.loadConfig();
    this.recoveryAttempts = new Map();
  }

  public static getInstance(registry: UnifiedServiceRegistry): UnifiedRecoveryService {
    if (!UnifiedRecoveryService.instance) {
      UnifiedRecoveryService.instance = new UnifiedRecoveryService(registry);
    }
    return UnifiedRecoveryService.instance;
  }

  private loadConfig(): RecoveryConfig {
    return {
      enabled: this.settings.get('recovery.enabled', true),
      autoRecovery: this.settings.get('recovery.autoRecovery', true),
      maxRetries: this.settings.get('recovery.maxRetries', 3),
      retryDelay: this.settings.get('recovery.retryDelay', 5000),
      backupVerification: this.settings.get('recovery.backupVerification', true),
      healthCheckInterval: this.settings.get('recovery.healthCheckInterval', 60000),
    };
  }

  public async performRecovery(component: string, action: string): Promise<RecoveryResult> {
    if (!this.config.enabled) {
      return {
        success: false,
        timestamp: Date.now(),
        component,
        action,
        error: 'Recovery service is disabled',
      };
    }

    const attemptKey = `${component}:${action}`;
    const attempts = (this.recoveryAttempts.get(attemptKey) || 0) + 1;
    this.recoveryAttempts.set(attemptKey, attempts);

    if (attempts > this.config.maxRetries) {
      return {
        success: false,
        timestamp: Date.now(),
        component,
        action,
        error: `Maximum recovery attempts (${this.config.maxRetries}) exceeded`,
      };
    }

    try {
      this.logger.info(`Starting recovery for ${component} (attempt ${attempts})`, 'recovery');

      // Verify latest backup
      if (this.config.backupVerification) {
        const backupPath = await this.getLatestBackup();
        if (backupPath) {
          const isValid = await this.backupService.verifyBackup(backupPath);
          if (!isValid) {
            throw new Error('Backup verification failed');
          }
        }
      }

      // Perform component-specific recovery
      const result = await this.recoverComponent(component, action);

      // Reset recovery attempts on success
      if (result.success) {
        this.recoveryAttempts.delete(attemptKey);
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Recovery failed: ${errorMessage}`, 'recovery');
      this.errorService.handleError(error, 'recovery', `${component}:${action}`);

      // Schedule retry if auto-recovery is enabled
      if (this.config.autoRecovery && attempts < this.config.maxRetries) {
        setTimeout(() => {
          this.performRecovery(component, action);
        }, this.config.retryDelay);
      }

      return {
        success: false,
        timestamp: Date.now(),
        component,
        action,
        error: errorMessage,
      };
    }
  }

  private async getLatestBackup(): Promise<string | null> {
    try {
      const backupDir = this.settings.get<string>('backup.path', './backups');
      const entries = await fs.readdir(backupDir);
      const backups = entries
        .filter(entry => entry.startsWith('backup_'))
        .sort()
        .reverse();

      return backups.length > 0 ? path.join(backupDir, backups[0]) : null;
    } catch (error) {
      this.logger.error('Failed to get latest backup', 'recovery');
      return null;
    }
  }

  private async recoverComponent(component: string, action: string): Promise<RecoveryResult> {
    switch (component) {
      case 'database':
        return this.recoverDatabase();
      case 'websocket':
        return this.recoverWebSocket();
      case 'api':
        return this.recoverAPI();
      case 'ml':
        return this.recoverML();
      default:
        throw new Error(`Unknown component: ${component}`);
    }
  }

  private async recoverDatabase(): Promise<RecoveryResult> {
    try {
      const dbConfig = this.settings.get<DatabaseConfig>('database', {});

      // Recover PostgreSQL
      if (dbConfig.postgres) {
        const { host, port, database, username, password } = dbConfig.postgres;
        const env = { ...process.env, PGPASSWORD: password };
        await execAsync(`pg_restore -h ${host} -p ${port} -U ${username} -d ${database} -c -v`, {
          env,
        });
      }

      // Recover Redis
      if (dbConfig.redis) {
        const { host, port, password } = dbConfig.redis;
        const env = { ...process.env, REDISCLI_AUTH: password };
        await execAsync(`redis-cli -h ${host} -p ${port} FLUSHALL`, { env });
      }

      return {
        success: true,
        timestamp: Date.now(),
        component: 'database',
        action: 'recovery',
      };
    } catch (error) {
      throw new Error(
        `Database recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async recoverWebSocket(): Promise<RecoveryResult> {
    try {
      // Implement WebSocket recovery logic
      return {
        success: true,
        timestamp: Date.now(),
        component: 'websocket',
        action: 'recovery',
      };
    } catch (error) {
      throw new Error(
        `WebSocket recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async recoverAPI(): Promise<RecoveryResult> {
    try {
      // Implement API recovery logic
      return {
        success: true,
        timestamp: Date.now(),
        component: 'api',
        action: 'recovery',
      };
    } catch (error) {
      throw new Error(
        `API recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async recoverML(): Promise<RecoveryResult> {
    try {
      // Implement ML model recovery logic
      return {
        success: true,
        timestamp: Date.now(),
        component: 'ml',
        action: 'recovery',
      };
    } catch (error) {
      throw new Error(
        `ML recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public getRecoveryAttempts(component: string, action: string): number {
    return this.recoveryAttempts.get(`${component}:${action}`) || 0;
  }

  public resetRecoveryAttempts(component: string, action: string): void {
    this.recoveryAttempts.delete(`${component}:${action}`);
  }

  public clearAllRecoveryAttempts(): void {
    this.recoveryAttempts.clear();
  }
}
