import { getInitializedUnifiedConfig, UnifiedConfig } from './UnifiedConfig'; // Use the synchronous getter
import { unifiedMonitor } from './UnifiedMonitor';
import { unifiedState } from './UnifiedState';

// src/core/PluginSystem.ts

// import { EventBus } from './EventBus'; // To be created
// import { UnifiedConfig } from './UnifiedConfig'; // To be created

// Potentially: import { useAppStore } from '../store/useAppStore';

/**
 * Defines the structure for a plugin.
 * Each plugin should have a unique name, version, and methods for initialization and potentially teardown.
 */
export interface Plugin {
  name: string;
  version: string;
  description?: string;

  /**
   * Called when the plugin is loaded and registered.
   * @param context Provides access to core app services or context if needed.
   */
  initialize: (context: PluginContext) => Promise<void> | void;

  /**
   * Optional: Called when the plugin is unloaded or the system is shutting down.
   */
  destroy?: () => Promise<void> | void;

  /**
   * Optional: Expose specific functionalities of the plugin.
   * The structure of `exports` is up to the plugin itself.
   */
  exports?: Record<string, any>;
}

/**
 * Provides context to plugins during initialization, such as access to core services
 * or the main application store.
 */
export interface PluginContext {
  log: (message: string, level?: 'info' | 'warn' | 'error') => void;
  getUnifiedConfig: () => UnifiedConfig; // Function to get the initialized config
  unifiedMonitor: typeof unifiedMonitor;
  unifiedState: typeof unifiedState;
  // getAppStoreState: () => ReturnType<typeof useAppStore.getState>; // Example for store access
  // dispatchAppStoreAction: (action: Function, payload?: any) => void; // Example for store access
  [key: string]: any; 
}

/**
 * PluginSystem class manages the registration, initialization, and lifecycle of plugins.
 */
class PluginSystemSingleton {
  private registeredPlugins: Map<string, Plugin> = new Map();
  private initializedPlugins: Map<string, Plugin> = new Map();
  private pluginContext: PluginContext;

  constructor() {
    
    // The application should ensure UnifiedConfig is initialized before plugins are registered.
    // If getInitializedUnifiedConfig() throws, plugin system construction will fail, which is appropriate.
    this.pluginContext = {
      log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
        // Generic log for the context itself, plugin-specific log will be created during plugin init
        
      },
      getUnifiedConfig: getInitializedUnifiedConfig, // This will throw if config is not ready
      unifiedMonitor,
      unifiedState,
    };
  }

  public async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.registeredPlugins.has(plugin.name)) {
      console.warn(`[PluginSystem] Plugin "${plugin.name}" version ${this.registeredPlugins.get(plugin.name)?.version} is already registered. New registration for version ${plugin.version} skipped.`);
      return;
    }
    
    this.registeredPlugins.set(plugin.name, plugin);

    try {
      const pluginSpecificContext: PluginContext = {
          ...this.pluginContext,
          // Override the log method to be specific to the plugin being initialized
          log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
            
          }
      };

      if (typeof plugin.initialize !== 'function') {
        throw new Error(`Plugin ${plugin.name} is missing the initialize method or it is not a function.`);
      }

      
      // Initialize the plugin with its specific context
      await plugin.initialize(pluginSpecificContext);
      this.initializedPlugins.set(plugin.name, plugin);
      
    } catch (error) {
      console.error(`[PluginSystem] Failed to initialize plugin "${plugin.name}":`, error);
      unifiedMonitor.reportError(error, { 
        pluginName: plugin.name, 
        stage: 'initialization', 
        message: error instanceof Error ? error.message : String(error) 
      });
      // Optionally remove from registered if initialization fails critically
      // this.registeredPlugins.delete(plugin.name);
    }
  }

  public getPlugin(name: string): Plugin | undefined {
    return this.initializedPlugins.get(name);
  }

  public getPluginApi<T = any>(pluginName: string, exportName: string): T | undefined {
    const plugin = this.initializedPlugins.get(pluginName);
    if (plugin && plugin.exports && typeof plugin.exports[exportName] !== 'undefined') {
      return plugin.exports[exportName] as T;
    }
    console.warn(`[PluginSystem] Export "${exportName}" not found in plugin "${pluginName}".`);
    return undefined;
  }

  public getAllInitializedPlugins(): Plugin[] {
    return Array.from(this.initializedPlugins.values());
  }

  public async unloadPlugin(name: string): Promise<void> {
    const plugin = this.initializedPlugins.get(name);
    if (plugin) {
      
      if (plugin.destroy) {
        try {
          await plugin.destroy();
          
        } catch (error) {
          console.error(`[PluginSystem] Error destroying plugin "${name}":`, error);
          // unifiedMonitor.reportError(error, { pluginName: name, stage: 'destruction' });
        }
      }
      this.initializedPlugins.delete(name);
      this.registeredPlugins.delete(name); // Also remove from registered if fully unloading
    } else {
      console.warn(`[PluginSystem] Plugin "${name}" not found or not initialized.`);
    }
  }

  public async unloadAllPlugins(): Promise<void> {
    
    for (const name of this.initializedPlugins.keys()) {
      await this.unloadPlugin(name);
    }
  }
}

// Export a singleton instance
export const pluginSystem = new PluginSystemSingleton();

// // Example Plugin:
// const MySamplePlugin: Plugin = {
//   name: 'SampleDataConnector',
//   version: '1.0.0',
//   description: 'Connects to a sample data source.',
//   async initialize(context: PluginContext) {
//     context.log('SampleDataConnector Initializing...');
//     // const config = await context.unifiedConfig.getSetting('sampleDataSourceUrl');
//     // 
//     this.exports.fetchData = async (params: any) => { 
//         context.log(`SampleDataConnector: fetchData called with ${JSON.stringify(params)}`);
//         return { sample: 'data', params }; 
//     };
//   },
//   async destroy() {
//     
//   },
//   exports: { // Define structure of exports here initially if known
//       fetchData: async (params: any): Promise<any> => { throw new Error('Not initialized'); }
//   }
// };
//
// // Registration example (e.g., in main.tsx or a dedicated plugin loader):
// pluginSystem.registerPlugin(MySamplePlugin);
//
// // Usage example:
// async function loadSampleData() {
//   const dataFetcher = pluginSystem.getPluginApi<typeof MySamplePlugin.exports.fetchData>('SampleDataConnector', 'fetchData');
//   if (dataFetcher) {
//     const data = await dataFetcher({ id: 123 });
//     
//   }
// }
// loadSampleData(); 