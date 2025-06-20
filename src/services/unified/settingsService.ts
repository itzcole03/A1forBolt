import { toast } from "react-toastify";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
    bettingAlerts: boolean;
    predictionUpdates: boolean;
    oddsChanges: boolean;
  };
  display: {
    oddsFormat: "decimal" | "fractional" | "american";
    timezone: string;
    dateFormat: string;
    currency: string;
    showLiveOdds: boolean;
    showPredictionConfidence: boolean;
    showRiskIndicators: boolean;
  };
  betting: {
    defaultStake: number;
    maxStake: number;
    autoConfirm: boolean;
    showArbitrage: boolean;
    showValueBets: boolean;
    riskProfile: "conservative" | "moderate" | "aggressive";
  };
  analytics: {
    refreshInterval: number;
    metricsWindow: "day" | "week" | "month" | "year";
    showAdvancedMetrics: boolean;
    exportFormat: "csv" | "json" | "excel";
  };
}

interface AppSettings {
  apiUrl: string;
  websocketUrl: string;
  environment: "development" | "staging" | "production";
  debug: boolean;
  maintenance: boolean;
  version: string;
}

class UnifiedSettingsService {
  private static instance: UnifiedSettingsService | null = null;
  private preferences: UserPreferences;
  private settings: AppSettings;
  private readonly STORAGE_KEY = "esa_settings";

  protected constructor() {
    this.preferences = this.loadPreferences();
    this.settings = this.loadSettings();
  }

  public static getInstance(): UnifiedSettingsService {
    if (!UnifiedSettingsService.instance) {
      UnifiedSettingsService.instance = new UnifiedSettingsService();
    }
    return UnifiedSettingsService.instance;
  }

  private loadPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_preferences`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }

    return this.getDefaultPreferences();
  }

  private loadSettings(): AppSettings {
    return {
      apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
      websocketUrl: import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8000",
      environment:
        (import.meta.env.VITE_ENV as AppSettings["environment"]) ||
        "development",
      debug: import.meta.env.VITE_DEBUG === "true",
      maintenance: false,
      version: import.meta.env.VITE_APP_VERSION || "1.0.0",
    };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: "system",
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        email: false,
        bettingAlerts: true,
        predictionUpdates: true,
        oddsChanges: true,
      },
      display: {
        oddsFormat: "decimal",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: "YYYY-MM-DD",
        currency: "USD",
        showLiveOdds: true,
        showPredictionConfidence: true,
        showRiskIndicators: true,
      },
      betting: {
        defaultStake: 10,
        maxStake: 1000,
        autoConfirm: false,
        showArbitrage: true,
        showValueBets: true,
        riskProfile: "moderate",
      },
      analytics: {
        refreshInterval: 30000,
        metricsWindow: "week",
        showAdvancedMetrics: false,
        exportFormat: "csv",
      },
    };
  }

  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updatePreferences(updates: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
    this.notifySettingsChange("preferences");
  }

  public updateSettings(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.notifySettingsChange("settings");
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(
        `${this.STORAGE_KEY}_preferences`,
        JSON.stringify(this.preferences),
      );
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    }
  }

  private notifySettingsChange(type: "preferences" | "settings"): void {
    // Dispatch a custom event that components can listen to
    const event = new CustomEvent("settingsChanged", {
      detail: {
        type,
        data: type === "preferences" ? this.preferences : this.settings,
      },
    });
    window.dispatchEvent(event);
  }

  public resetPreferences(): void {
    this.preferences = this.getDefaultPreferences();
    this.savePreferences();
    this.notifySettingsChange("preferences");
    toast.success("Preferences reset to default values");
  }

  public exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  public importPreferences(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      this.preferences = { ...this.getDefaultPreferences(), ...imported };
      this.savePreferences();
      this.notifySettingsChange("preferences");
      toast.success("Preferences imported successfully");
      return true;
    } catch (error) {
      console.error("Error importing preferences:", error);
      toast.error("Failed to import preferences");
      return false;
    }
  }

  public isMaintenanceMode(): boolean {
    return this.settings.maintenance;
  }

  public getVersion(): string {
    return this.settings.version;
  }

  public isDebugMode(): boolean {
    return this.settings.debug;
  }
}

export default UnifiedSettingsService;
