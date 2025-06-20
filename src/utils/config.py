"""
Configuration utility for the System Analysis Tool.
Handles loading and managing configuration settings from YAML files.
"""

import os
from pathlib import Path
from typing import Any, Dict, Optional

import yaml
from pydantic import BaseSettings, Field

class Config(BaseSettings):
    """Configuration manager for the System Analysis Tool."""
    
    # Analysis settings
    performance_enabled: bool = Field(default=True)
    security_enabled: bool = Field(default=True)
    resources_enabled: bool = Field(default=True)
    
    # Monitoring settings
    metrics_interval: int = Field(default=300)  # seconds
    logging_level: str = Field(default="INFO")
    log_file: str = Field(default="logs/system_analysis.log")
    
    # Reporting settings
    report_format: str = Field(default="html")
    output_dir: str = Field(default="reports/")
    report_retention: int = Field(default=30)  # days
    
    # Database settings
    db_type: str = Field(default="sqlite")
    db_path: str = Field(default="data/system_analysis.db")
    
    # API settings
    api_host: str = Field(default="localhost")
    api_port: int = Field(default=8000)
    
    def __init__(self, config_path: str):
        """Initialize configuration from YAML file."""
        super().__init__()
        self.config_path = config_path
        self.config_data = self._load_config()
        self._update_settings()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file."""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except Exception as e:
            raise ValueError(f"Error loading configuration file: {str(e)}")
    
    def _update_settings(self):
        """Update settings from loaded configuration."""
        if not self.config_data:
            return
            
        # Update analysis settings
        if 'analysis' in self.config_data:
            analysis = self.config_data['analysis']
            if 'performance' in analysis:
                self.performance_enabled = analysis['performance'].get('enabled', True)
            if 'security' in analysis:
                self.security_enabled = analysis['security'].get('enabled', True)
            if 'resources' in analysis:
                self.resources_enabled = analysis['resources'].get('enabled', True)
        
        # Update monitoring settings
        if 'monitoring' in self.config_data:
            monitoring = self.config_data['monitoring']
            if 'logging' in monitoring:
                logging_config = monitoring['logging']
                self.logging_level = logging_config.get('level', 'INFO')
                self.log_file = logging_config.get('file', 'logs/system_analysis.log')
        
        # Update reporting settings
        if 'reporting' in self.config_data:
            reporting = self.config_data['reporting']
            if 'reports' in reporting:
                reports_config = reporting['reports']
                self.report_format = reports_config.get('format', 'html')
                self.output_dir = reports_config.get('output_dir', 'reports/')
                self.report_retention = reports_config.get('retention', 30)
        
        # Update database settings
        if 'database' in self.config_data:
            db = self.config_data['database']
            self.db_type = db.get('type', 'sqlite')
            self.db_path = db.get('path', 'data/system_analysis.db')
        
        # Update API settings
        if 'api' in self.config_data:
            api = self.config_data['api']
            self.api_host = api.get('host', 'localhost')
            self.api_port = api.get('port', 8000)
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value by key."""
        return self.config_data.get(key, default)
    
    def save(self, path: Optional[str] = None) -> None:
        """Save current configuration to file."""
        save_path = path or self.config_path
        try:
            with open(save_path, 'w') as f:
                yaml.dump(self.config_data, f, default_flow_style=False)
        except Exception as e:
            raise ValueError(f"Error saving configuration file: {str(e)}")
    
    def validate(self) -> bool:
        """Validate configuration settings."""
        # Check required directories exist
        required_dirs = [
            os.path.dirname(self.log_file),
            self.output_dir,
            os.path.dirname(self.db_path)
        ]
        
        for directory in required_dirs:
            if not os.path.exists(directory):
                try:
                    os.makedirs(directory)
                except Exception as e:
                    raise ValueError(f"Error creating directory {directory}: {str(e)}")
        
        # Validate settings
        if self.metrics_interval < 1:
            raise ValueError("Metrics interval must be positive")
        
        if self.report_retention < 1:
            raise ValueError("Report retention must be positive")
        
        if self.api_port < 1 or self.api_port > 65535:
            raise ValueError("Invalid API port number")
        
        return True 