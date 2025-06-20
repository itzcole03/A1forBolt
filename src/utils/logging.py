"""
Logging utility for the System Analysis Tool.
Provides centralized logging configuration and management.
"""

import logging
import logging.handlers
import os
from pathlib import Path
from typing import Optional

def setup_logging(
    level: int = logging.INFO,
    log_file: Optional[str] = None,
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5,
    format_str: Optional[str] = None
) -> None:
    """
    Set up logging configuration for the application.
    
    Args:
        level: Logging level (default: INFO)
        log_file: Path to log file (default: None, logs to console only)
        max_bytes: Maximum size of log file before rotation (default: 10MB)
        backup_count: Number of backup log files to keep (default: 5)
        format_str: Custom log format string (default: None, uses standard format)
    """
    # Create formatter
    if format_str is None:
        format_str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    formatter = logging.Formatter(format_str)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Add file handler if log file specified
    if log_file:
        # Create log directory if it doesn't exist
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # Create rotating file handler
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: Name of the logger
        
    Returns:
        logging.Logger: Configured logger instance
    """
    return logging.getLogger(name)

class LogCapture:
    """Context manager for capturing log output."""
    
    def __init__(self, logger_name: str, level: int = logging.INFO):
        """
        Initialize log capture.
        
        Args:
            logger_name: Name of the logger to capture
            level: Logging level to capture
        """
        self.logger = logging.getLogger(logger_name)
        self.level = level
        self.handler = None
        self.records = []
    
    def __enter__(self):
        """Set up log capture."""
        self.handler = LogCaptureHandler(self.records)
        self.handler.setLevel(self.level)
        self.logger.addHandler(self.handler)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Clean up log capture."""
        if self.handler:
            self.logger.removeHandler(self.handler)
    
    def get_records(self):
        """Get captured log records."""
        return self.records

class LogCaptureHandler(logging.Handler):
    """Custom handler for capturing log records."""
    
    def __init__(self, records):
        """
        Initialize log capture handler.
        
        Args:
            records: List to store captured log records
        """
        super().__init__()
        self.records = records
    
    def emit(self, record):
        """Store log record."""
        self.records.append(record) 