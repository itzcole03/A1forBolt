// AuditLogger: Centralized audit logging for sensitive actions
// Persistent storage, compliance integration, and rate limiting are tracked in dev/copilot_roadmap.md under audit enhancements.

export type AuditAction = 'predict' | 'bet' | 'updateUser' | 'login' | 'apiCall';

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: AuditAction;
  details: Record<string, any>;
  timestamp: number;
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];

  log(action: AuditAction, details: Record<string, any>, userId?: string) {
    const entry: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      action,
      details,
      timestamp: Date.now(),
    };
    this.logs.push(entry);
    // See dev/copilot_roadmap.md: persistent storage, compliance, and rate limiting are tracked and prioritized for future implementation.
  }

  getLogs() {
    return this.logs;
  }
}

export const auditLogger = new AuditLogger();
