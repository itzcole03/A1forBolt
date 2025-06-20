"""
Performance analysis module for the System Analysis Tool.
Analyzes system performance metrics and provides insights.
"""

import logging
import psutil
from typing import Dict, List, Optional, Tuple

from src.utils.config import Config

logger = logging.getLogger(__name__)

class PerformanceAnalyzer:
    """Analyzes system performance metrics."""
    
    def __init__(self, config: Config):
        """
        Initialize performance analyzer.
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.thresholds = self._load_thresholds()
    
    def _load_thresholds(self) -> Dict[str, Dict[str, float]]:
        """Load performance thresholds from configuration."""
        thresholds = {
            'cpu': {
                'warning': 80.0,
                'critical': 90.0
            },
            'memory': {
                'warning': 75.0,
                'critical': 85.0
            },
            'disk': {
                'warning': 80.0,
                'critical': 90.0
            }
        }
        
        # Update thresholds from config if available
        if 'analysis' in self.config.config_data:
            analysis = self.config.config_data['analysis']
            if 'performance' in analysis and 'thresholds' in analysis['performance']:
                config_thresholds = analysis['performance']['thresholds']
                for metric, values in config_thresholds.items():
                    if metric in thresholds:
                        thresholds[metric].update(values)
        
        return thresholds
    
    def analyze(self, metrics: Dict) -> Dict:
        """
        Analyze system performance metrics.
        
        Args:
            metrics: Dictionary of collected metrics
            
        Returns:
            Dict containing analysis results
        """
        results = {
            'cpu': self._analyze_cpu(metrics.get('cpu', {})),
            'memory': self._analyze_memory(metrics.get('memory', {})),
            'disk': self._analyze_disk(metrics.get('disk', {})),
            'network': self._analyze_network(metrics.get('network', {})),
            'processes': self._analyze_processes(metrics.get('processes', []))
        }
        
        # Calculate overall system health
        results['health'] = self._calculate_health(results)
        
        return results
    
    def _analyze_cpu(self, cpu_metrics: Dict) -> Dict:
        """Analyze CPU metrics."""
        results = {
            'usage': cpu_metrics.get('usage', 0.0),
            'status': 'normal',
            'issues': []
        }
        
        # Check CPU usage against thresholds
        if results['usage'] >= self.thresholds['cpu']['critical']:
            results['status'] = 'critical'
            results['issues'].append(f"CPU usage is critically high: {results['usage']}%")
        elif results['usage'] >= self.thresholds['cpu']['warning']:
            results['status'] = 'warning'
            results['issues'].append(f"CPU usage is high: {results['usage']}%")
        
        return results
    
    def _analyze_memory(self, memory_metrics: Dict) -> Dict:
        """Analyze memory metrics."""
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
    
    def _analyze_disk(self, disk_metrics: Dict) -> Dict:
        """Analyze disk metrics."""
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
    
    def _analyze_network(self, network_metrics: Dict) -> Dict:
        """Analyze network metrics."""
        results = {
            'bytes_sent': network_metrics.get('bytes_sent', 0),
            'bytes_recv': network_metrics.get('bytes_recv', 0),
            'packets_sent': network_metrics.get('packets_sent', 0),
            'packets_recv': network_metrics.get('packets_recv', 0),
            'status': 'normal',
            'issues': []
        }
        
        # Add network-specific analysis here
        # For example, check for unusual traffic patterns
        
        return results
    
    def _analyze_processes(self, processes: List[Dict]) -> Dict:
        """Analyze process metrics."""
        results = {
            'total': len(processes),
            'high_cpu': [],
            'high_memory': [],
            'status': 'normal',
            'issues': []
        }
        
        # Analyze individual processes
        for process in processes:
            if process.get('cpu_percent', 0) > 50:
                results['high_cpu'].append({
                    'pid': process.get('pid'),
                    'name': process.get('name'),
                    'cpu_percent': process.get('cpu_percent')
                })
            
            if process.get('memory_percent', 0) > 5:
                results['high_memory'].append({
                    'pid': process.get('pid'),
                    'name': process.get('name'),
                    'memory_percent': process.get('memory_percent')
                })
        
        # Update status based on findings
        if len(results['high_cpu']) > 5:
            results['status'] = 'warning'
            results['issues'].append(f"High number of CPU-intensive processes: {len(results['high_cpu'])}")
        
        if len(results['high_memory']) > 5:
            results['status'] = 'warning'
            results['issues'].append(f"High number of memory-intensive processes: {len(results['high_memory'])}")
        
        return results
    
    def _calculate_health(self, results: Dict) -> Dict:
        """Calculate overall system health."""
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