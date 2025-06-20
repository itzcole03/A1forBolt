"""
Metrics collection module for the System Analysis Tool.
Collects various system metrics for analysis.
"""

import logging
import os
import platform
import psutil
import socket
from datetime import datetime
from typing import Dict, List, Optional

from src.utils.config import Config

logger = logging.getLogger(__name__)

class MetricsCollector:
    """Collects system metrics for analysis."""
    
    def __init__(self, config: Config):
        """
        Initialize metrics collector.
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.collection_interval = config.get('monitoring.metrics_interval', 60)
    
    def collect_all(self) -> Dict:
        """
        Collect all system metrics.
        
        Returns:
            Dict containing all collected metrics
        """
        try:
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'system': self._collect_system_info(),
                'cpu': self._collect_cpu_metrics(),
                'memory': self._collect_memory_metrics(),
                'disk': self._collect_disk_metrics(),
                'network': self._collect_network_metrics(),
                'processes': self._collect_process_metrics(),
                'file_system': self._collect_file_system_metrics()
            }
            return metrics
        except Exception as e:
            logger.error(f"Error collecting metrics: {str(e)}")
            raise
    
    def _collect_system_info(self) -> Dict:
        """Collect basic system information."""
        return {
            'hostname': socket.gethostname(),
            'platform': platform.system(),
            'platform_version': platform.version(),
            'architecture': platform.machine(),
            'processor': platform.processor(),
            'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat()
        }
    
    def _collect_cpu_metrics(self) -> Dict:
        """Collect CPU metrics."""
        cpu_times = psutil.cpu_times()
        return {
            'usage_percent': psutil.cpu_percent(interval=1),
            'count': psutil.cpu_count(),
            'count_logical': psutil.cpu_count(logical=True),
            'frequency': {
                'current': psutil.cpu_freq().current if psutil.cpu_freq() else None,
                'min': psutil.cpu_freq().min if psutil.cpu_freq() else None,
                'max': psutil.cpu_freq().max if psutil.cpu_freq() else None
            },
            'times': {
                'user': cpu_times.user,
                'system': cpu_times.system,
                'idle': cpu_times.idle,
                'iowait': getattr(cpu_times, 'iowait', 0)
            },
            'load_average': psutil.getloadavg()
        }
    
    def _collect_memory_metrics(self) -> Dict:
        """Collect memory metrics."""
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        return {
            'virtual': {
                'total': memory.total,
                'available': memory.available,
                'used': memory.used,
                'free': memory.free,
                'usage': memory.percent
            },
            'swap': {
                'total': swap.total,
                'used': swap.used,
                'free': swap.free,
                'usage': swap.percent
            }
        }
    
    def _collect_disk_metrics(self) -> Dict:
        """Collect disk metrics."""
        partitions = []
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                partitions.append({
                    'device': partition.device,
                    'mountpoint': partition.mountpoint,
                    'fstype': partition.fstype,
                    'opts': partition.opts,
                    'total': usage.total,
                    'used': usage.used,
                    'free': usage.free,
                    'usage': usage.percent
                })
            except Exception as e:
                logger.warning(f"Error getting disk usage for {partition.mountpoint}: {str(e)}")
        
        io_counters = psutil.disk_io_counters()
        return {
            'partitions': partitions,
            'io': {
                'read_bytes': io_counters.read_bytes,
                'write_bytes': io_counters.write_bytes,
                'read_count': io_counters.read_count,
                'write_count': io_counters.write_count,
                'read_time': io_counters.read_time,
                'write_time': io_counters.write_time
            }
        }
    
    def _collect_network_metrics(self) -> Dict:
        """Collect network metrics."""
        net_io = psutil.net_io_counters()
        net_connections = psutil.net_connections()
        
        return {
            'io': {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv,
                'errin': net_io.errin,
                'errout': net_io.errout,
                'dropin': net_io.dropin,
                'dropout': net_io.dropout
            },
            'connections': len(net_connections),
            'interfaces': self._get_network_interfaces()
        }
    
    def _get_network_interfaces(self) -> List[Dict]:
        """Get network interface information."""
        interfaces = []
        for interface, addrs in psutil.net_if_addrs().items():
            interface_info = {
                'name': interface,
                'addresses': []
            }
            
            for addr in addrs:
                interface_info['addresses'].append({
                    'family': str(addr.family),
                    'address': addr.address,
                    'netmask': addr.netmask,
                    'broadcast': addr.broadcast
                })
            
            interfaces.append(interface_info)
        
        return interfaces
    
    def _collect_process_metrics(self) -> List[Dict]:
        """Collect process metrics."""
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'username', 'status', 'cpu_percent', 'memory_percent']):
            try:
                process_info = proc.info
                processes.append({
                    'pid': process_info['pid'],
                    'name': process_info['name'],
                    'username': process_info['username'],
                    'status': process_info['status'],
                    'cpu_percent': process_info['cpu_percent'],
                    'memory_percent': process_info['memory_percent']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        return processes
    
    def _collect_file_system_metrics(self) -> Dict:
        """Collect file system metrics."""
        total_files = 0
        total_dirs = 0
        largest_files = []
        
        # Get the root directory to scan
        root_dir = self.config.get('analysis.resources.root_directory', '/')
        
        try:
            for root, dirs, files in os.walk(root_dir):
                total_dirs += len(dirs)
                total_files += len(files)
                
                # Get file sizes
                for file in files:
                    try:
                        file_path = os.path.join(root, file)
                        size = os.path.getsize(file_path)
                        if size > 1024 * 1024:  # Only track files > 1MB
                            largest_files.append({
                                'path': file_path,
                                'size': size
                            })
                    except (OSError, PermissionError):
                        continue
                
                # Limit the number of files we track
                if total_files > 1000000:  # Stop after 1 million files
                    break
        except Exception as e:
            logger.warning(f"Error scanning file system: {str(e)}")
        
        # Sort and limit largest files
        largest_files.sort(key=lambda x: x['size'], reverse=True)
        largest_files = largest_files[:100]  # Keep top 100 largest files
        
        return {
            'total_files': total_files,
            'total_dirs': total_dirs,
            'largest_files': largest_files
        } 