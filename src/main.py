#!/usr/bin/env python3
"""
System Analysis Tool - Main Entry Point
A comprehensive system analysis tool that leverages AI to analyze and optimize system performance,
security, and resource utilization.
"""

import argparse
import logging
import os
import sys
from pathlib import Path

from src.analysis.performance import PerformanceAnalyzer
from src.analysis.security import SecurityAnalyzer
from src.analysis.resources import ResourceAnalyzer
from src.monitoring.metrics import MetricsCollector
from src.reporting.generators import ReportGenerator
from src.utils.config import Config
from src.utils.logging import setup_logging

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="System Analysis Tool")
    parser.add_argument("--config", type=str, default="config/default.yaml",
                      help="Path to configuration file")
    parser.add_argument("--output", type=str, default="reports/",
                      help="Output directory for reports")
    parser.add_argument("--mode", type=str, choices=["basic", "advanced", "custom"],
                      default="basic", help="Analysis mode")
    parser.add_argument("--verbose", action="store_true",
                      help="Enable verbose logging")
    return parser.parse_args()

def main():
    """Main entry point for the system analysis tool."""
    # Parse command line arguments
    args = parse_args()

    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    setup_logging(log_level)

    # Load configuration
    config = Config(args.config)
    
    try:
        # Initialize components
        metrics_collector = MetricsCollector(config)
        performance_analyzer = PerformanceAnalyzer(config)
        security_analyzer = SecurityAnalyzer(config)
        resource_analyzer = ResourceAnalyzer(config)
        report_generator = ReportGenerator(config)

        # Collect metrics
        logging.info("Collecting system metrics...")
        metrics = metrics_collector.collect()

        # Perform analysis
        logging.info("Performing system analysis...")
        performance_results = performance_analyzer.analyze(metrics)
        security_results = security_analyzer.analyze(metrics)
        resource_results = resource_analyzer.analyze(metrics)

        # Generate report
        logging.info("Generating analysis report...")
        report_path = report_generator.generate(
            performance_results,
            security_results,
            resource_results,
            output_dir=args.output
        )

        logging.info(f"Analysis complete. Report generated at: {report_path}")

    except Exception as e:
        logging.error(f"Error during system analysis: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 