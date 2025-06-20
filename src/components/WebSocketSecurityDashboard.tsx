import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface ConnectionStatus {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error";
  lastSeen: Date;
  messageCount: number;
  security: "secure" | "insecure";
}

export const WebSocketSecurityDashboard: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [securityLevel, setSecurityLevel] = useState<"high" | "medium" | "low">(
    "high",
  );

  useEffect(() => {
    // Mock connection data
    const mockConnections: ConnectionStatus[] = [
      {
        id: "odds-feed",
        name: "Live Odds Feed",
        status: "connected",
        lastSeen: new Date(),
        messageCount: 1247,
        security: "secure",
      },
      {
        id: "prediction-stream",
        name: "ML Prediction Stream",
        status: "connected",
        lastSeen: new Date(Date.now() - 30000),
        messageCount: 342,
        security: "secure",
      },
      {
        id: "arbitrage-alerts",
        name: "Arbitrage Alerts",
        status: "disconnected",
        lastSeen: new Date(Date.now() - 120000),
        messageCount: 89,
        security: "secure",
      },
    ];

    setConnections(mockConnections);

    // Update connections periodically
    const interval = setInterval(() => {
      setConnections((prev) =>
        prev.map((conn) => ({
          ...conn,
          messageCount:
            conn.status === "connected"
              ? conn.messageCount + Math.floor(Math.random() * 5)
              : conn.messageCount,
          lastSeen: conn.status === "connected" ? new Date() : conn.lastSeen,
        })),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <WifiOff className="w-4 h-4 text-gray-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSecurityIcon = (security: string) => {
    return security === "secure" ? (
      <Lock className="w-4 h-4 text-green-500" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-red-500" />
    );
  };

  const connectedCount = connections.filter(
    (c) => c.status === "connected",
  ).length;
  const secureCount = connections.filter((c) => c.security === "secure").length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              WebSocket Security Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time connection monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {connectedCount}/{connections.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Connected
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {secureCount}/{connections.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Secure
            </div>
          </div>
        </div>
      </div>

      {/* Security Level Indicator */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle
              className={`w-5 h-5 ${
                securityLevel === "high"
                  ? "text-green-500"
                  : securityLevel === "medium"
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            />
            <span className="font-medium text-gray-900 dark:text-white">
              Security Level: {securityLevel.toUpperCase()}
            </span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-3 h-6 rounded ${
                  level <=
                  (securityLevel === "high"
                    ? 3
                    : securityLevel === "medium"
                      ? 2
                      : 1)
                    ? securityLevel === "high"
                      ? "bg-green-500"
                      : securityLevel === "medium"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Connection List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Active Connections
        </h3>

        {connections.map((connection) => (
          <div
            key={connection.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(connection.status)}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {connection.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last seen: {connection.lastSeen.toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {connection.messageCount.toLocaleString()} messages
                </div>
                <div className="flex items-center space-x-1">
                  {getSecurityIcon(connection.security)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {connection.security}
                  </span>
                </div>
              </div>

              <div
                className={`w-3 h-3 rounded-full ${
                  connection.status === "connected"
                    ? "bg-green-500 animate-pulse"
                    : connection.status === "error"
                      ? "bg-red-500"
                      : "bg-gray-400"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Security Recommendations */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          Security Recommendations
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• All connections use SSL/TLS encryption</li>
          <li>• Connection tokens are rotated every 24 hours</li>
          <li>• Rate limiting is active on all endpoints</li>
          <li>• Failed connection attempts are monitored</li>
        </ul>
      </div>
    </div>
  );
};

export default WebSocketSecurityDashboard;
