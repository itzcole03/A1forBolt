"""
Resource analysis module for the System Analysis Tool.
Analyzes system resource utilization and provides insights.
"""

import logging
import os
import psutil
from typing import Dict, List, Optional, Tuple

from src.utils.config import Config

logger = logging.getLogger(__name__)

class ResourceAnalyzer:
    """Analyzes system resource utilization."""
    
    def __init__(self, config: Config):
        """
        Initialize resource analyzer.
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.thresholds = self._load_thresholds()
    
    def _load_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Load resource thresholds from configuration."""
        thresholds = {
            'disk': {
                'warning': 80.0,
                'critical': 90.0
            },
            'memory': {
                'warning': 75.0,
                'critical': 85.0
            },
            'swap': {
                'warning': 70.0,
                'critical': 80.0
            }
        }
        
        # Update thresholds from config if available
        if 'analysis' in self.config.config_data:
            analysis = self.config.config_data['analysis']
            if 'resources' in analysis and 'thresholds' in analysis['resources']:
                config_thresholds = analysis['resources']['thresholds']
                for metric, values in config_thresholds.items():
                    if metric in thresholds:
                        thresholds[metric].update(values)
        
        return thresholds
    
    def analyze(self, metrics: Dict) -> Dict:
        """
        Analyze system resource utilization.
        
        Args:
            metrics: Dictionary of collected metrics
            
        Returns:
            Dict containing analysis results
        """
        results = {
            'disk': self._analyze_disk(metrics.get('disk', {})),
            'memory': self._analyze_memory(metrics.get('memory', {})),
            'swap': self._analyze_swap(metrics.get('swap', {})),
            'file_system': self._analyze_file_system(metrics.get('file_system', {})),
            'processes': self._analyze_processes(metrics.get('processes', []))
        }
        
        # Calculate overall resource health
        results['health'] = self._calculate_health(results)
        
        return results
    
    def _analyze_disk(self, disk_metrics: Dict) -> Dict:
        """Analyze disk usage."""
        results = {
            'usage': disk_metrics.get('usage', 0.0),
            'free': disk_metrics.get('free', 0),
            'total': disk_metrics.get('total', 0),
            'status': 'normal',
            'issues': []
        }
        
        # Check disk usage against thresholds
        if results['usage'] >= self.thresholds['disk']['critical']:
            results['status'] = 'critical'
            results['issues'].append(f"Disk usage is critically high: {results['usage']}%")
        elif results['usage'] >= self.thresholds['disk']['warning']:
            results['status'] = 'warning'
            results['issues'].append(f"Disk usage is high: {results['usage']}%")
        
        return results
    
    def _analyze_memory(self, memory_metrics: Dict) -> Dict:
        """Analyze memory usage."""
        results = {
            'usage': memory_metrics.get('usage', 0.0),
            'available': memory_metrics.get('available', 0),
            'total': memory_metrics.get('total', 0),
            'status': 'normal',
            'issues': []
        }
        
        # Check memory usage against thresholds
        if results['usage'] >= self.thresholds['memory']['critical']:
            results['status'] = 'critical'
            results['issues'].append(f"Memory usage is critically high: {results['usage']}%")
        elif results['usage'] >= self.thresholds['memory']['warning']:
            results['status'] = 'warning'
            results['issues'].append(f"Memory usage is high: {results['usage']}%")
        
        return results
    
    def _analyze_swap(self, swap_metrics: Dict) -> Dict:
        """Analyze swap usage."""
        results = {
            'usage': swap_metrics.get('usage', 0.0),
            'free': swap_metrics.get('free', 0),
            'total': swap_metrics.get('total', 0),
            'status': 'normal',
            'issues': []
        }
        
        # Check swap usage against thresholds
        if results['usage'] >= self.thresholds['swap']['critical']:
            results['status'] = 'critical'
            results['issues'].append(f"Swap usage is critically high: {results['usage']}%")
        elif results['usage'] >= self.thresholds['swap']['warning']:
            results['status'] = 'warning'
            results['issues'].append(f"Swap usage is high: {results['usage']}%")
        
        return results
    
    def _analyze_file_system(self, fs_metrics: Dict) -> Dict:
        """Analyze file system usage."""
        results = {
            'total_files': fs_metrics.get('total_files', 0),
            'total_dirs': fs_metrics.get('total_dirs', 0),
            'largest_files': fs_metrics.get('largest_files', []),
            'status': 'normal',
            'issues': []
        }
        
        # Check for large files
        large_files = [f for f in results['largest_files'] if f.get('size', 0) > 1024 * 1024 * 1024]  # > 1GB
        if large_files:
            results['status'] = 'warning'
            results['issues'].append(f"Found {len(large_files)} files larger than 1GB")
        
        return results
    
    def _analyze_processes(self, processes: List[Dict]) -> Dict:
        """Analyze process resource usage."""
        results = {
            'total': len(processes),
            'high_cpu': [],
            'high_memory': [],
            'zombie': [],
            'status': 'normal',
            'issues': []
        }
        
        # Analyze individual processes
        for process in processes:
            # Check CPU usage
            if process.get('cpu_percent', 0) > 50:
                results['high_cpu'].append({
                    'pid': process.get('pid'),
                    'name': process.get('name'),
                    'cpu_percent': process.get('cpu_percent')
                })
            
            # Check memory usage
            if process.get('memory_percent', 0) > 5:
                results['high_memory'].append({
                    'pid': process.get('pid'),
                    'name': process.get('name'),
                    'memory_percent': process.get('memory_percent')
                })
            
            # Check for zombie processes
            if process.get('status') == 'zombie':
                results['zombie'].append({
                    'pid': process.get('pid'),
                    'name': process.get('name')
                })
        
        # Update status based on findings
        if results['zombie']:
            results['status'] = 'warning'
            results['issues'].append(f"Found {len(results['zombie'])} zombie processes")
        
        if len(results['high_cpu']) > 5:
            results['status'] = 'warning'
            results['issues'].append(f"High number of CPU-intensive processes: {len(results['high_cpu'])}")
        
        if len(results['high_memory']) > 5:
            results['status'] = 'warning'
            results['issues'].append(f"High number of memory-intensive processes: {len(results['high_memory'])}")
        
        return results
    
    def _calculate_health(self, results: Dict) -> Dict:
        """Calculate overall resource health."""
        health = {
            'status': 'healthy',
            'score': 100,
            'issues': []
        }
        
        # Check each component's status
        for component, result in results.items():
            if component == 'health':
                continue
                
            if result['status'] == 'critical':
                health['score'] -= 25
                health['issues'].extend(result['issues'])
            elif result['status'] == 'warning':
                health['score'] -= 10
                health['issues'].extend(result['issues'])
        
        # Update overall status
        if health['score'] <= 50:
            health['status'] = 'critical'
        elif health['score'] <= 75:
            health['status'] = 'warning'
        
        return health 