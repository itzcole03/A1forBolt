import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Fab,
  BottomNavigation,
  BottomNavigationAction,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Paper,
  Stack,
  Grid,
  useTheme,
  useMediaQuery,
  Slide,
  Collapse,
  Alert,
  Snackbar,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Divider,
  Skeleton,
} from "@mui/material";
import {
  Home,
  Analytics,
  TrendingUp,
  AccountBalance,
  Settings,
  Notifications,
  Search,
  Add,
  Remove,
  SwapVert,
  FilterList,
  Sort,
  Share,
  Bookmark,
  Star,
  Menu,
  Close,
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore,
  PlayArrow,
  Pause,
  Refresh,
  Download,
  Upload,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Lock,
  LockOpen,
  MonetizationOn,
  Assessment,
  Timeline,
  ShowChart,
  BarChart,
  PieChart,
  Speed,
  Psychology,
  AutoAwesome,
  Group,
  Person,
  Security,
  Help,
  Feedback,
  ExitToApp,
} from "@mui/icons-material";
import {
  formatCurrency,
  formatPercentage,
  formatDateTime,
} from "../../utils/formatters";

interface MobileCard {
  id: string;
  type: "metric" | "chart" | "action" | "news" | "opportunity";
  title: string;
  subtitle?: string;
  value?: number | string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  action?: () => void;
  priority: "high" | "medium" | "low";
  category: string;
  data?: any;
  timestamp?: Date;
}

interface SwipeableCardStackProps {
  cards: MobileCard[];
  onCardSwipe: (cardId: string, direction: "left" | "right") => void;
  onCardTap: (card: MobileCard) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "error";
  action: () => void;
  badge?: number;
}

const SwipeableCardStack: React.FC<SwipeableCardStackProps> = ({
  cards,
  onCardSwipe,
  onCardTap,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const handleDragEnd = useCallback(
    (info: PanInfo) => {
      const threshold = 100;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
        const direction = offset > 0 ? "right" : "left";
        const currentCard = cards[currentIndex];

        if (currentCard) {
          onCardSwipe(currentCard.id, direction);
        }

        setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
      }

      setDragOffset(0);
    },
    [cards, currentIndex, onCardSwipe],
  );

  if (cards.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={200}
      >
        <Typography variant="body2" color="textSecondary">
          No cards to display
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        height: 280,
        width: "100%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AnimatePresence>
        {cards.slice(currentIndex, currentIndex + 3).map((card, index) => (
          <motion.div
            key={`${card.id}-${currentIndex + index}`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => index === 0 && handleDragEnd(info)}
            onTap={() => onCardTap(card)}
            initial={{
              scale: 1 - index * 0.05,
              y: index * 10,
              zIndex: 10 - index,
              opacity: 1,
            }}
            animate={{
              scale: 1 - index * 0.05,
              y: index * 10,
              zIndex: 10 - index,
              opacity: 1 - index * 0.3,
              x: index === 0 ? dragOffset : 0,
            }}
            exit={{
              x: dragOffset > 0 ? 300 : -300,
              opacity: 0,
              transition: { duration: 0.3 },
            }}
            style={{
              position: "absolute",
              width: "90%",
              cursor: "pointer",
            }}
          >
            <Card
              sx={{
                height: 240,
                background:
                  index === 0
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "rgba(255,255,255,0.95)",
                color: index === 0 ? "white" : "inherit",
                backdropFilter: "blur(10px)",
                border:
                  index === 0 ? "none" : "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Chip
                      label={card.category}
                      size="small"
                      sx={{
                        backgroundColor:
                          index === 0
                            ? "rgba(255,255,255,0.2)"
                            : "primary.main",
                        color: index === 0 ? "white" : "white",
                      }}
                    />
                    <Chip
                      label={card.priority}
                      size="small"
                      color={
                        card.priority === "high"
                          ? "error"
                          : card.priority === "medium"
                            ? "warning"
                            : "success"
                      }
                    />
                  </Box>

                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    {card.title}
                  </Typography>

                  {card.subtitle && (
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.8 }}
                      gutterBottom
                    >
                      {card.subtitle}
                    </Typography>
                  )}
                </Box>

                <Box>
                  {card.type === "metric" && card.value && (
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        {typeof card.value === "number"
                          ? formatCurrency(card.value)
                          : card.value}
                      </Typography>
                      {card.change && (
                        <Box display="flex" alignItems="center" gap={1}>
                          {card.trend === "up" ? (
                            <TrendingUp />
                          ) : (
                            <TrendingUp
                              style={{ transform: "rotate(180deg)" }}
                            />
                          )}
                          <Typography variant="body2">
                            {formatPercentage(Math.abs(card.change))}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {card.type === "opportunity" && (
                    <Box>
                      <Typography
                        variant="h4"
                        color="success.main"
                        fontWeight="bold"
                      >
                        {formatCurrency(card.data?.profit || 0)}
                      </Typography>
                      <Typography variant="body2">
                        Guaranteed Profit •{" "}
                        {formatPercentage(card.data?.margin || 0)} margin
                      </Typography>
                    </Box>
                  )}

                  {card.timestamp && (
                    <Typography
                      variant="caption"
                      sx={{ opacity: 0.6, mt: 1, display: "block" }}
                    >
                      {formatDateTime(card.timestamp)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Progress Indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
        }}
      >
        {cards.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor:
                index === currentIndex ? "white" : "rgba(255,255,255,0.3)",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export const MobileOptimizedInterface: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State Management
  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MobileCard | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Mock Data
  const mobileCards: MobileCard[] = [
    {
      id: "profit-today",
      type: "metric",
      title: "Today's Profit",
      value: 234.5,
      change: 0.15,
      trend: "up",
      priority: "high",
      category: "Performance",
      timestamp: new Date(),
    },
    {
      id: "arbitrage-opp",
      type: "opportunity",
      title: "Lakers vs Warriors",
      subtitle: "Arbitrage Opportunity",
      priority: "high",
      category: "Arbitrage",
      data: { profit: 43.2, margin: 0.043 },
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "win-rate",
      type: "metric",
      title: "Win Rate (7 days)",
      value: "64.2%",
      change: 0.08,
      trend: "up",
      priority: "medium",
      category: "Analytics",
      timestamp: new Date(Date.now() - 600000),
    },
    {
      id: "ml-prediction",
      type: "action",
      title: "New ML Prediction",
      subtitle: "Chiefs vs Bills - 89% confidence",
      priority: "medium",
      category: "ML",
      action: () => console.log("View prediction"),
      timestamp: new Date(Date.now() - 900000),
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "place-bet",
      label: "Place Bet",
      icon: <MonetizationOn />,
      color: "primary",
      action: () => handleQuickAction("place-bet"),
    },
    {
      id: "check-arbitrage",
      label: "Arbitrage",
      icon: <SwapVert />,
      color: "success",
      action: () => handleQuickAction("check-arbitrage"),
      badge: 3,
    },
    {
      id: "ml-insights",
      label: "ML Insights",
      icon: <Psychology />,
      color: "secondary",
      action: () => handleQuickAction("ml-insights"),
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: <AccountBalance />,
      color: "warning",
      action: () => handleQuickAction("portfolio"),
    },
  ];

  // Event Handlers
  const handleCardSwipe = useCallback(
    (cardId: string, direction: "left" | "right") => {
      const action = direction === "right" ? "saved" : "dismissed";
      setSnackbarMessage(`Card ${action}`);
      setSnackbarOpen(true);
    },
    [],
  );

  const handleCardTap = useCallback((card: MobileCard) => {
    setSelectedCard(card);
    if (card.action) {
      card.action();
    }
  }, []);

  const handleQuickAction = useCallback((actionId: string) => {
    setIsLoading(true);
    setSnackbarMessage(`Executing ${actionId}...`);
    setSnackbarOpen(true);

    setTimeout(() => {
      setIsLoading(false);
      setQuickActionsOpen(false);
    }, 2000);
  }, []);

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    [],
  );

  // Load notifications
  useEffect(() => {
    const mockNotifications = [
      {
        id: "notif-1",
        title: "New Arbitrage Opportunity",
        message: "Lakers vs Warriors - 4.3% profit margin",
        type: "opportunity",
        timestamp: new Date(Date.now() - 300000),
      },
      {
        id: "notif-2",
        title: "ML Model Updated",
        message: "Ensemble model accuracy improved to 74.2%",
        type: "update",
        timestamp: new Date(Date.now() - 900000),
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  if (!isMobile) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={400}
      >
        <Alert severity="info">
          This interface is optimized for mobile devices. Please resize your
          browser or use a mobile device.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ backgroundColor: "background.paper" }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1, color: "text.primary" }}>
            A1Betting Mobile
          </Typography>

          <IconButton color="inherit" sx={{ color: "text.primary" }}>
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              style={{ height: "100%", overflow: "auto", padding: "16px" }}
            >
              {/* Quick Stats */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Card sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      color="success.main"
                      fontWeight="bold"
                    >
                      {formatCurrency(1247.5)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Total Profit
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card sx={{ textAlign: "center", p: 2 }}>
                    <Typography
                      variant="h4"
                      color="primary.main"
                      fontWeight="bold"
                    >
                      64.2%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Win Rate
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Swipeable Cards */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Updates
                </Typography>
                <SwipeableCardStack
                  cards={mobileCards}
                  onCardSwipe={handleCardSwipe}
                  onCardTap={handleCardTap}
                />
              </Box>

              {/* Quick Actions Grid */}
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {quickActions.map((action) => (
                  <Grid item xs={6} key={action.id}>
                    <Card
                      sx={{
                        p: 2,
                        textAlign: "center",
                        cursor: "pointer",
                        "&:hover": { transform: "scale(1.02)" },
                        transition: "transform 0.2s ease",
                      }}
                      onClick={action.action}
                    >
                      <Badge badgeContent={action.badge} color="error">
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            backgroundColor: `${action.color}.main`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 1,
                            color: "white",
                          }}
                        >
                          {action.icon}
                        </Box>
                      </Badge>
                      <Typography variant="body2" fontWeight="medium">
                        {action.label}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              style={{ height: "100%", overflow: "auto", padding: "16px" }}
            >
              <Typography variant="h5" gutterBottom>
                Analytics
              </Typography>

              {/* Mobile-optimized charts */}
              <Stack spacing={2}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Profit Trend (7 Days)
                  </Typography>
                  <Box
                    sx={{
                      height: 200,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      📈 Chart visualization would go here
                    </Typography>
                  </Box>
                </Card>

                <Card sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Performance by Sport
                  </Typography>
                  <Stack spacing={1}>
                    {["NBA", "NFL", "MLB", "Tennis"].map((sport) => (
                      <Box
                        key={sport}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">{sport}</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.random() * 100}
                            sx={{ width: 60 }}
                          />
                          <Typography variant="caption">
                            {formatPercentage(Math.random())}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              style={{ height: "100%", overflow: "auto", padding: "16px" }}
            >
              <Typography variant="h5" gutterBottom>
                Portfolio
              </Typography>

              <Stack spacing={2}>
                <Card sx={{ p: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Current Positions</Typography>
                    <Chip label="5 Active" color="primary" size="small" />
                  </Box>

                  <Stack spacing={2}>
                    {["Lakers ML", "Chiefs -3.5", "Over 2.5 Goals"].map(
                      (position, index) => (
                        <Box
                          key={position}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            p: 2,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {position}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Stake: {formatCurrency(100 + index * 50)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography
                              variant="body2"
                              color={
                                Math.random() > 0.5
                                  ? "success.main"
                                  : "error.main"
                              }
                              fontWeight="bold"
                            >
                              {formatCurrency((Math.random() - 0.5) * 100)}
                            </Typography>
                            <Typography variant="caption">
                              {formatPercentage((Math.random() - 0.5) * 0.2)}
                            </Typography>
                          </Box>
                        </Box>
                      ),
                    )}
                  </Stack>
                </Card>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Bottom Navigation */}
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation value={activeTab} onChange={handleTabChange}>
          <BottomNavigationAction label="Home" icon={<Home />} />
          <BottomNavigationAction label="Analytics" icon={<Analytics />} />
          <BottomNavigationAction label="Portfolio" icon={<AccountBalance />} />
          <BottomNavigationAction label="Settings" icon={<Settings />} />
        </BottomNavigation>
      </Paper>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: "fixed", bottom: 80, right: 16 }}
        icon={<SpeedDialIcon />}
        open={quickActionsOpen}
        onClose={() => setQuickActionsOpen(false)}
        onOpen={() => setQuickActionsOpen(true)}
      >
        {quickActions.map((action) => (
          <SpeedDialAction
            key={action.id}
            icon={action.icon}
            tooltipTitle={action.label}
            onClick={action.action}
          />
        ))}
      </SpeedDial>

      {/* Navigation Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "80%",
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar sx={{ width: 56, height: 56 }}>U</Avatar>
            <Box>
              <Typography variant="h6">John Doe</Typography>
              <Typography variant="body2" color="textSecondary">
                Premium Member
              </Typography>
            </Box>
          </Box>

          <List>
            {[
              {
                icon: <Home />,
                text: "Dashboard",
                action: () => setActiveTab(0),
              },
              {
                icon: <Analytics />,
                text: "Analytics",
                action: () => setActiveTab(1),
              },
              {
                icon: <AccountBalance />,
                text: "Portfolio",
                action: () => setActiveTab(2),
              },
              {
                icon: <Settings />,
                text: "Settings",
                action: () => setActiveTab(3),
              },
              { icon: <Security />, text: "Security" },
              { icon: <Help />, text: "Help & Support" },
              { icon: <Feedback />, text: "Feedback" },
              { icon: <ExitToApp />, text: "Logout" },
            ].map((item, index) => (
              <ListItem
                key={item.text}
                onClick={() => {
                  item.action?.();
                  setDrawerOpen(false);
                }}
                sx={{ cursor: "pointer" }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Card Detail Dialog */}
      <Dialog
        fullScreen
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setSelectedCard(null)}
            >
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              {selectedCard?.title}
            </Typography>
            <Button autoFocus color="inherit">
              Save
            </Button>
          </Toolbar>
        </AppBar>

        <DialogContent>
          {selectedCard && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {selectedCard.title}
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                {selectedCard.subtitle}
              </Typography>

              {selectedCard.type === "metric" && (
                <Card sx={{ p: 3, textAlign: "center", mb: 2 }}>
                  <Typography
                    variant="h2"
                    color="primary.main"
                    fontWeight="bold"
                  >
                    {typeof selectedCard.value === "number"
                      ? formatCurrency(selectedCard.value)
                      : selectedCard.value}
                  </Typography>
                  {selectedCard.change && (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      gap={1}
                      mt={1}
                    >
                      {selectedCard.trend === "up" ? (
                        <TrendingUp color="success" />
                      ) : (
                        <TrendingUp
                          style={{
                            transform: "rotate(180deg)",
                            color: theme.palette.error.main,
                          }}
                        />
                      )}
                      <Typography
                        variant="h6"
                        color={
                          selectedCard.trend === "up"
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {formatPercentage(Math.abs(selectedCard.change))}
                      </Typography>
                    </Box>
                  )}
                </Card>
              )}

              <Button variant="contained" fullWidth size="large" sx={{ mt: 2 }}>
                Take Action
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <Box textAlign="center" sx={{ color: "white" }}>
              <CircularProgress color="inherit" size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Loading...
              </Typography>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Box>
  );
};

export default MobileOptimizedInterface;
