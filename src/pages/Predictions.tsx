import React, { useState, useEffect, useRef } from "react";
import GlassCard from '../components/ui/GlassCard';
import EnhancedPropCard from '../components/ui/EnhancedPropCard';
import GlowButton from '../components/ui/GlowButton';
import Tooltip from '../components/ui/Tooltip';
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      aria-labelledby={`predictions-tab-${index}`}
      hidden={value !== index}
      id={`predictions-tabpanel-${index}`}
      role="tabpanel"
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  "ws://localhost:8000/ws/model-predictions/client-frontend";

const riskProfiles = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const Predictions: React.FC = () => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<number | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [riskProfile, setRiskProfile] = useState("medium");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Safety checks to prevent invalid WebSocket connections
    if (
      !WS_URL ||
      WS_URL === "" ||
      WS_URL === "wss://api.betproai.com/ws" ||
      WS_URL.includes("api.betproai.com") ||
      WS_URL.includes("localhost:8000") ||
      import.meta.env.VITE_ENABLE_WEBSOCKET === "false"
    ) {
      console.log(
        "WebSocket connection disabled for Predictions page:",
        WS_URL,
      );
      setLoading(false);
      setError("WebSocket connections are currently disabled");
      return;
    }

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "prediction_request",
          features: {},
          riskProfile: { type: riskProfile },
        }),
      );
    };
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "prediction_result") {
          setPredictions(
            Array.isArray(msg.data.prediction)
              ? msg.data.prediction
              : [msg.data.prediction],
          );
          setLoading(false);
        } else if (msg.type === "error") {
          setError(msg.data?.message || "Error fetching predictions");
          setLoading(false);
        } else {
          // Handle other message types if needed
        }
      } catch (e) {
        setError("Malformed message from server");
        setLoading(false);
      }
    };
    ws.onerror = () => {
      setError("WebSocket error");
      setLoading(false);
    };
    ws.onclose = () => {
      // Optionally: try to reconnect
    };
    return () => {
      ws.close();
    };
  }, [riskProfile]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    predictionId: number,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedPrediction(predictionId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPrediction(null);
  };

  const handleAction = (action: string) => {
    // TODO: Implement bet actions
    handleMenuClose();
  };

  const filteredPredictions = predictions.filter(
    (p) =>
      (!search ||
        p.match?.toLowerCase().includes(search.toLowerCase()) ||
        p.sport?.toLowerCase().includes(search.toLowerCase())) &&
      (value === 0
        ? p.status === "active"
        : value === 1
          ? p.status === "completed"
          : true),
  );

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gradient-to-br from-purple-900/80 to-purple-700/80 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <GlassCard className="mb-8">
        <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4">Model Predictions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPredictions.length === 0 && !loading && (
            <Grid item xs={12}>
              <Typography>No predictions found.</Typography>
            </Grid>
          )}
          {filteredPredictions.map((prediction) => (
            <Grid key={prediction.id} item xs={12}>
              <EnhancedPropCard
                playerName={prediction.match}
                team={prediction.sport}
                position={prediction.prediction}
                statType="Confidence"
                line={Math.round(prediction.confidence * 100)}
                overOdds={prediction.odds}
                underOdds={prediction.odds}
                pickType="normal"
                trendValue={prediction.trend === "up" ? 1 : -1}
                gameInfo={{ opponent: 'BOS', day: 'Fri', time: '7:30pm' }}
                playerImageUrl="https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png"
                onSelect={() => {}}
                onViewDetails={() => {}}
              />
            </Grid>
          ))}
        </div>
      </GlassCard>
      {/* Advanced Widgets or analytics can be added here as needed */}
    </div>
  );
};

export default Predictions;
