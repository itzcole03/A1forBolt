"""
Report generation module for the System Analysis Tool.
Formats and outputs analysis results in various formats.
"""

import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Optional

import matplotlib.pyplot as plt
import pandas as pd
from jinja2 import Environment, FileSystemLoader

from src.utils.config import Config

logger = logging.getLogger(__name__)

class ReportGenerator:
    """Generates reports from analysis results."""
    
    def __init__(self, config: Config):
        """
        Initialize report generator.
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.output_dir = config.get('reporting.output_directory', 'reports')
        self.report_format = config.get('reporting.format', 'html')
        self.template_dir = os.path.join(os.path.dirname(__file__), 'templates')
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Initialize Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(self.template_dir),
            autoescape=True
        )
    
    def generate_report(self, metrics: Dict, analysis_results: Dict) -> str:
        """
        Generate a report from metrics and analysis results.
        
        Args:
            metrics: Dictionary of collected metrics
            analysis_results: Dictionary of analysis results
            
        Returns:
            Path to the generated report
        """
        try:
            # Generate timestamp for the report
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            # Generate report based on format
            if self.report_format == 'html':
                report_path = self._generate_html_report(metrics, analysis_results, timestamp)
            elif self.report_format == 'json':
                report_path = self._generate_json_report(metrics, analysis_results, timestamp)
            elif self.report_format == 'csv':
                report_path = self._generate_csv_report(metrics, analysis_results, timestamp)
            else:
                raise ValueError(f"Unsupported report format: {self.report_format}")
            
            # Generate visualizations
            self._generate_visualizations(metrics, analysis_results, timestamp)
            
            return report_path
        except Exception as e:
            logger.error(f"Error generating report: {str(e)}")
            raise
    
    def _generate_html_report(self, metrics: Dict, analysis_results: Dict, timestamp: str) -> str:
        """Generate HTML report."""
        # Load template
        template = self.jinja_env.get_template('report.html')
        
        # Prepare data for template
        template_data = {
            'timestamp': datetime.now().isoformat(),
            'system_info': metrics['system'],
            'performance': analysis_results.get('performance', {}),
            'security': analysis_results.get('security', {}),
            'resources': analysis_results.get('resources', {}),
            'metrics': metrics
        }
        
        # Render template
        html_content = template.render(**template_data)
        
        # Save report
        report_path = os.path.join(self.output_dir, f'report_{timestamp}.html')
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return report_path
    
    def _generate_json_report(self, metrics: Dict, analysis_results: Dict, timestamp: str) -> str:
        """Generate JSON report."""
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'metrics': metrics,
            'analysis': analysis_results
        }
        
        report_path = os.path.join(self.output_dir, f'report_{timestamp}.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2)
        
        return report_path
    
    def _generate_csv_report(self, metrics: Dict, analysis_results: Dict, timestamp: str) -> str:
        """Generate CSV report."""
        # Convert metrics to DataFrame
        metrics_df = pd.DataFrame([metrics])
        
        # Convert analysis results to DataFrame
        analysis_df = pd.DataFrame([analysis_results])
        
        # Save reports
        metrics_path = os.path.join(self.output_dir, f'metrics_{timestamp}.csv')
        analysis_path = os.path.join(self.output_dir, f'analysis_{timestamp}.csv')
        
        metrics_df.to_csv(metrics_path, index=False)
        analysis_df.to_csv(analysis_path, index=False)
        
        return metrics_path, analysis_path
    
    def _generate_visualizations(self, metrics: Dict, analysis_results: Dict, timestamp: str):
        """Generate visualization plots."""
        # Create visualizations directory
        viz_dir = os.path.join(self.output_dir, 'visualizations', timestamp)
        os.makedirs(viz_dir, exist_ok=True)
        
        # CPU Usage Plot
        self._plot_cpu_usage(metrics['cpu'], viz_dir)
        
        # Memory Usage Plot
        self._plot_memory_usage(metrics['memory'], viz_dir)
        
        # Disk Usage Plot
        self._plot_disk_usage(metrics['disk'], viz_dir)
        
        # Process Resource Usage Plot
        self._plot_process_usage(metrics['processes'], viz_dir)
        
        # Health Score Plot
        self._plot_health_scores(analysis_results, viz_dir)
    
    def _plot_cpu_usage(self, cpu_metrics: Dict, output_dir: str):
        """Plot CPU usage metrics."""
        plt.figure(figsize=(10, 6))
        
        # Plot CPU times
        times = cpu_metrics['times']
        plt.bar(times.keys(), times.values())
        plt.title('CPU Times Distribution')
        plt.ylabel('Time (seconds)')
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'cpu_usage.png'))
        plt.close()
    
    def _plot_memory_usage(self, memory_metrics: Dict, output_dir: str):
        """Plot memory usage metrics."""
        plt.figure(figsize=(10, 6))
        
        # Plot virtual memory usage
        virtual = memory_metrics['virtual']
        plt.pie([virtual['used'], virtual['free']],
                labels=['Used', 'Free'],
                autopct='%1.1f%%')
        plt.title('Virtual Memory Usage')
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'memory_usage.png'))
        plt.close()
    
    def _plot_disk_usage(self, disk_metrics: Dict, output_dir: str):
        """Plot disk usage metrics."""
        plt.figure(figsize=(12, 6))
        
        # Plot partition usage
        partitions = disk_metrics['partitions']
        labels = [p['mountpoint'] for p in partitions]
        used = [p['used'] for p in partitions]
        free = [p['free'] for p in partitions]
        
        plt.bar(labels, used, label='Used')
        plt.bar(labels, free, bottom=used, label='Free')
        plt.title('Disk Usage by Partition')
        plt.ylabel('Space (bytes)')
        plt.xticks(rotation=45)
        plt.legend()
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'disk_usage.png'))
        plt.close()
    
    def _plot_process_usage(self, processes: List[Dict], output_dir: str):
        """Plot process resource usage."""
        plt.figure(figsize=(12, 6))
        
        # Get top 10 processes by CPU usage
        top_cpu = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[:10]
        
        plt.barh([p['name'] for p in top_cpu],
                 [p['cpu_percent'] for p in top_cpu])
        plt.title('Top 10 Processes by CPU Usage')
        plt.xlabel('CPU Usage (%)')
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'process_usage.png'))
        plt.close()
    
    def _plot_health_scores(self, analysis_results: Dict, output_dir: str):
        """Plot system health scores."""
        plt.figure(figsize=(10, 6))
        
        # Extract health scores
        scores = {
            'Performance': analysis_results.get('performance', {}).get('health', {}).get('score', 0),
            'Security': analysis_results.get('security', {}).get('health', {}).get('score', 0),
            'Resources': analysis_results.get('resources', {}).get('health', {}).get('score', 0)
        }
        
        plt.bar(scores.keys(), scores.values())
        plt.title('System Health Scores')
        plt.ylabel('Score')
        plt.ylim(0, 100)
        
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'health_scores.png'))
        plt.close() 