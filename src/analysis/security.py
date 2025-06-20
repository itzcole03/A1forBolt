"""
Security analysis module for the System Analysis Tool.
Analyzes system security metrics and provides insights.
"""

import logging
import os
import platform
import socket
import subprocess
from typing import Dict, List, Optional, Tuple

from src.utils.config import Config

logger = logging.getLogger(__name__)

class SecurityAnalyzer:
    """Analyzes system security metrics."""
    
    def __init__(self, config: Config):
        """
        Initialize security analyzer.
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.checks = self._load_security_checks()
    
    def _load_security_checks(self) -> Dict[str, bool]:
        """Load security check configuration."""
        checks = {
            'open_ports': True,
            'running_services': True,
            'system_updates': True,
            'firewall_status': True,
            'antivirus_status': True,
            'ssl_certificates': True
        }
        
        # Update checks from config if available
        if 'analysis' in self.config.config_data:
            analysis = self.config.config_data['analysis']
            if 'security' in analysis and 'checks' in analysis['security']:
                config_checks = analysis['security']['checks']
                for check in config_checks:
                    if check in checks:
                        checks[check] = True
        
        return checks
    
    def analyze(self, metrics: Dict) -> Dict:
        """
        Analyze system security metrics.
        
        Args:
            metrics: Dictionary of collected metrics
            
        Returns:
            Dict containing analysis results
        """
        results = {
            'ports': self._analyze_ports(metrics.get('ports', [])),
            'services': self._analyze_services(metrics.get('services', [])),
            'updates': self._analyze_updates(metrics.get('updates', {})),
            'firewall': self._analyze_firewall(metrics.get('firewall', {})),
            'antivirus': self._analyze_antivirus(metrics.get('antivirus', {})),
            'ssl': self._analyze_ssl(metrics.get('ssl', []))
        }
        
        # Calculate overall security score
        results['security_score'] = self._calculate_security_score(results)
        
        return results
    
    def _analyze_ports(self, ports: List[Dict]) -> Dict:
        """Analyze open ports."""
        results = {
            'total': len(ports),
            'open': [],
            'status': 'normal',
            'issues': []
        }
        
        # Check for commonly vulnerable ports
        vulnerable_ports = {
            21: 'FTP',
            22: 'SSH',
            23: 'Telnet',
            25: 'SMTP',
            3389: 'RDP'
        }
        
        for port in ports:
            port_num = port.get('port')
            if port_num in vulnerable_ports:
                results['open'].append({
                    'port': port_num,
                    'service': vulnerable_ports[port_num],
                    'state': port.get('state', 'unknown')
                })
        
        if results['open']:
            results['status'] = 'warning'
            results['issues'].append(f"Found {len(results['open'])} potentially vulnerable ports open")
        
        return results
    
    def _analyze_services(self, services: List[Dict]) -> Dict:
        """Analyze running services."""
        results = {
            'total': len(services),
            'vulnerable': [],
            'status': 'normal',
            'issues': []
        }
        
        # Check for known vulnerable services
        vulnerable_services = [
            'telnet',
            'ftp',
            'rsh',
            'rlogin',
            'rexec'
        ]
        
        for service in services:
            name = service.get('name', '').lower()
            if name in vulnerable_services:
                results['vulnerable'].append({
                    'name': name,
                    'status': service.get('status', 'unknown')
                })
        
        if results['vulnerable']:
            results['status'] = 'warning'
            results['issues'].append(f"Found {len(results['vulnerable'])} potentially vulnerable services running")
        
        return results
    
    def _analyze_updates(self, updates: Dict) -> Dict:
        """Analyze system updates."""
        results = {
            'last_update': updates.get('last_update', 'unknown'),
            'updates_available': updates.get('updates_available', 0),
            'status': 'normal',
            'issues': []
        }
        
        if results['updates_available'] > 0:
            results['status'] = 'warning'
            results['issues'].append(f"System has {results['updates_available']} updates available")
        
        return results
    
    def _analyze_firewall(self, firewall: Dict) -> Dict:
        """Analyze firewall status."""
        results = {
            'enabled': firewall.get('enabled', False),
            'rules': firewall.get('rules', []),
            'status': 'normal',
            'issues': []
        }
        
        if not results['enabled']:
            results['status'] = 'critical'
            results['issues'].append("Firewall is not enabled")
        
        return results
    
    def _analyze_antivirus(self, antivirus: Dict) -> Dict:
        """Analyze antivirus status."""
        results = {
            'enabled': antivirus.get('enabled', False),
            'last_scan': antivirus.get('last_scan', 'unknown'),
            'status': 'normal',
            'issues': []
        }
        
        if not results['enabled']:
            results['status'] = 'critical'
            results['issues'].append("Antivirus is not enabled")
        
        return results
    
    def _analyze_ssl(self, ssl_certs: List[Dict]) -> Dict:
        """Analyze SSL certificates."""
        results = {
            'total': len(ssl_certs),
            'expired': [],
            'expiring_soon': [],
            'status': 'normal',
            'issues': []
        }
        
        for cert in ssl_certs:
            if cert.get('expired', False):
                results['expired'].append(cert)
            elif cert.get('expiring_soon', False):
                results['expiring_soon'].append(cert)
        
        if results['expired']:
            results['status'] = 'critical'
            results['issues'].append(f"Found {len(results['expired'])} expired SSL certificates")
        elif results['expiring_soon']:
            results['status'] = 'warning'
            results['issues'].append(f"Found {len(results['expiring_soon'])} SSL certificates expiring soon")
        
        return results
    
    def _calculate_security_score(self, results: Dict) -> Dict:
        """Calculate overall security score."""
        score = {
            'score': 100,
            'status': 'secure',
            'issues': []
        }
        
        # Check each component's status
        for component, result in results.items():
            if component == 'security_score':
                continue
                
            if result['status'] == 'critical':
                score['score'] -= 25
                score['issues'].extend(result['issues'])
            elif result['status'] == 'warning':
                score['score'] -= 10
                score['issues'].extend(result['issues'])
        
        # Update overall status
        if score['score'] <= 50:
            score['status'] = 'critical'
        elif score['score'] <= 75:
            score['status'] = 'warning'
        
        return score 