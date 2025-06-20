type Job = () => Promise<void> | void;

interface ScheduledJob {
  id: string;
  job: Job;
  interval: number;
  timer?: NodeJS.Timeout;
  running: boolean;
}

class Scheduler {
  private jobs: Map<string, ScheduledJob> = new Map();

  schedule(id: string, job: Job, interval: number) {
    this.cancel(id);
    const scheduledJob: ScheduledJob = {
      id,
      job,
      interval,
      running: false,
    };
    scheduledJob.timer = setInterval(async () => {
      if (scheduledJob.running) return;
      scheduledJob.running = true;
      try {
        await job();
      } catch (err) {
        console.error(`[Scheduler] Error in job '${id}':`, err);
      } finally {
        scheduledJob.running = false;
      }
    }, interval);
    this.jobs.set(id, scheduledJob);
  }

  cancel(id: string) {
    const job = this.jobs.get(id);
    if (job && job.timer) {
      clearInterval(job.timer);
      this.jobs.delete(id);
    }
  }

  cancelAll() {
    Array.from(this.jobs.keys()).forEach(id => this.cancel(id));
  }

  isScheduled(id: string): boolean {
    return this.jobs.has(id);
  }
}

export const scheduler = new Scheduler();
