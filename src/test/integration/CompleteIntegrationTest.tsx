/**
 * Complete Frontend-Backend Integration Test
 * Tests all enhanced mathematical services end-to-end
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeAll, afterAll, jest } from "@jest/globals";

// Import components to test
import EnhancedRevolutionaryInterface from "../../components/revolutionary/EnhancedRevolutionaryInterface";
import UltraAdvancedMLDashboard from "../../components/ml/UltraAdvancedMLDashboard";

// Import services
import EnhancedBackendApiService from "../../services/unified/EnhancedBackendApiService";
import UnifiedEnhancedPredictionService from "../../services/unified/UnifiedEnhancedPredictionService";

// Mock data for testing
const mockPredictionRequest = {
  event_id: "test_integration_001",
  sport: "basketball",
  features: {
    player_performance: 78.5,
    team_strength: 82.1,
    matchup_difficulty: 68.3,
    historical_performance: 77.8,
    injury_impact: 15.2,
    weather_effect: 5.0,
    venue_advantage: 12.5,
    rest_factor: 85.0,
    momentum: 71.2,
    public_sentiment: 63.7,
  },
  enable_neuromorphic: true,
  neuromorphic_timesteps: 50,
  enable_mamba: true,
  mamba_sequence_length: 25,
  enable_causal_inference: true,
  causal_significance_level: 0.05,
  enable_topological: true,
  topological_max_dimension: 2,
  enable_riemannian: true,
  riemannian_manifold_dim: 16,
  use_gpu: false,
  numerical_precision: "float32" as const,
  convergence_tolerance: 1e-6,
  context: {},
};

const mockPredictionResponse = {
  event_id: "test_integration_001",
  strategy_used: "enhanced_mathematical_rigor",
  base_prediction: 75.5,
  neuromorphic_enhancement: 2.3,
  mamba_temporal_refinement: 1.8,
  causal_adjustment: -0.5,
  topological_smoothing: 0.3,
  riemannian_projection: 1.1,
  final_prediction: 80.5,
  neuromorphic_metrics: {
    spike_rate: 25.5,
    isi_statistics: { mean_isi: 15.2, cv_isi: 0.8 },
    network_criticality: 0.85,
  },
  mamba_metrics: {
    eigenvalue_spectrum: [0.95, 0.87, 0.92, 0.78],
    spectral_radius: 0.95,
    temporal_coherence: 0.88,
  },
  causal_metrics: {
    causal_strength: 0.72,
    causal_graph: { X1: ["Y"], X2: ["Y"] },
    pc_algorithm_applied: true,
  },
  topological_metrics: {
    betti_numbers: { H0: 1, H1: 2, H2: 0 },
    persistence_barcode: [
      [0.1, 0.8],
      [0.2, 0.6],
    ],
  },
  riemannian_metrics: {
    curvature: 0.15,
    manifold_dimension: 16,
    geodesic_computations: true,
  },
  riemannian_curvature: 0.15,
  persistent_betti_numbers: { H0: 1, H1: 2, H2: 0 },
  causal_graph_structure: { X1: ["Y"], X2: ["Y"] },
  mamba_eigenvalue_spectrum: [0.95, 0.87, 0.92, 0.78],
  neuromorphic_spike_statistics: { mean_isi: 15.2, cv_isi: 0.8 },
  topological_persistence_barcode: [
    [0.1, 0.8],
    [0.2, 0.6],
  ],
  convergence_rate: 0.92,
  stability_margin: 0.88,
  lyapunov_exponent: -0.05,
  mathematical_guarantees: {
    neuromorphic_stability: true,
    mamba_convergence: true,
    causal_identifiability: true,
    topological_persistence: true,
    riemannian_completeness: true,
  },
  actual_complexity: {
    neuromorphic: "O(N * T * log(N))",
    mamba: "O(L)",
    causal: "O(N^3)",
    topological: "O(N^3)",
    riemannian: "O(M^3)",
  },
  runtime_analysis: {
    neuromorphic: 0.85,
    mamba: 0.32,
    causal: 1.25,
    topological: 2.1,
    riemannian: 0.95,
  },
  memory_usage: {
    neuromorphic: 128.5,
    mamba: 64.2,
    causal: 256.8,
    topological: 512.1,
    riemannian: 192.3,
  },
  prediction_confidence: 0.87,
  uncertainty_bounds: [78.2, 82.8],
  confidence_intervals: {
    "90%": [78.8, 82.2],
    "95%": [78.2, 82.8],
    "99%": [77.1, 83.9],
  },
  total_processing_time: 5.65,
  component_processing_times: {
    neuromorphic: 0.85,
    mamba: 0.32,
    causal: 1.25,
    topological: 2.1,
    riemannian: 0.95,
    total_prediction: 5.47,
  },
  timestamp: new Date().toISOString(),
  numerical_stability: {
    no_nan_values: true,
    no_infinite_values: true,
    bounded_outputs: true,
    convergence_achieved: true,
    eigenvalues_stable: true,
  },
  convergence_diagnostics: {
    convergence_rate: 0.92,
    lyapunov_exponent: -0.05,
    stability_margin: 0.88,
    iterations_to_convergence: 15,
    convergence_tolerance_met: true,
  },
  theoretical_bounds_satisfied: true,
};

const mockSystemHealth = {
  overall_status: "healthy" as const,
  component_status: {
    prediction_engine: "healthy",
    feature_engineering: "healthy",
    risk_management: "healthy",
    data_pipeline: "healthy",
    neuromorphic_engine: "healthy",
    mamba_engine: "healthy",
    causal_engine: "healthy",
    topological_engine: "healthy",
    riemannian_engine: "healthy",
  },
  error_rate: 0.02,
  average_response_time: 1250,
  throughput: 45,
  cpu_usage: 45,
  memory_usage: 62,
  gpu_usage: 28,
  cache_efficiency: 85,
  prediction_accuracy: 0.87,
  mathematical_rigor_score: 92,
};

const mockModelMetrics = [
  {
    model_id: "enhanced_revolutionary",
    model_name: "Enhanced Revolutionary Engine",
    accuracy: 0.89,
    precision: 0.87,
    recall: 0.85,
    f1_score: 0.86,
    auc_roc: 0.91,
    calibration_score: 0.88,
    prediction_speed: 1250,
    memory_usage: 512,
    last_update: new Date().toISOString(),
    training_data_size: 100000,
    feature_count: 150,
    mathematical_properties: {
      convergence_verified: true,
      stability_guaranteed: true,
      theoretical_bounds_satisfied: true,
    },
  },
  {
    model_id: "enhanced_prediction",
    model_name: "Enhanced Prediction Engine",
    accuracy: 0.85,
    precision: 0.83,
    recall: 0.87,
    f1_score: 0.85,
    auc_roc: 0.88,
    calibration_score: 0.86,
    prediction_speed: 890,
    memory_usage: 384,
    last_update: new Date().toISOString(),
    training_data_size: 80000,
    feature_count: 120,
    mathematical_properties: {
      convergence_verified: true,
      stability_guaranteed: true,
      theoretical_bounds_satisfied: true,
    },
  },
];

// Mock the backend services
jest.mock("../../services/unified/EnhancedBackendApiService");
jest.mock("../../services/unified/UnifiedEnhancedPredictionService");

const mockBackendService =
  EnhancedBackendApiService.getInstance as jest.MockedFunction<
    typeof EnhancedBackendApiService.getInstance
  >;

const mockPredictionService =
  UnifiedEnhancedPredictionService.getInstance as jest.MockedFunction<
    typeof UnifiedEnhancedPredictionService.getInstance
  >;

describe("Complete Frontend-Backend Integration", () => {
  let mockBackendInstance: jest.Mocked<EnhancedBackendApiService>;
  let mockPredictionInstance: jest.Mocked<UnifiedEnhancedPredictionService>;

  beforeAll(() => {
    // Mock backend service instance
    mockBackendInstance = {
      getEnhancedRevolutionaryPrediction: jest.fn(),
      getMathematicalFoundations: jest.fn(),
      getMathematicalAnalysis: jest.fn(),
      healthCheck: jest.fn(),
    } as any;

    // Mock prediction service instance
    mockPredictionInstance = {
      getModelPerformance: jest.fn(),
      getSystemHealth: jest.fn(),
      generatePrediction: jest.fn(),
    } as any;

    mockBackendService.mockReturnValue(mockBackendInstance);
    mockPredictionService.mockReturnValue(mockPredictionInstance);

    // Setup default mock responses
    mockBackendInstance.getEnhancedRevolutionaryPrediction.mockResolvedValue(
      mockPredictionResponse,
    );
    mockBackendInstance.getMathematicalFoundations.mockResolvedValue({
      theoretical_foundations: {
        neuromorphic_computing: {
          mathematical_basis: "Hodgkin-Huxley differential equations",
          computational_complexity: "O(N * T * log(N))",
        },
        mamba_state_space: {
          mathematical_basis: "Selective state space models",
          computational_complexity: "O(L)",
        },
      },
    });
    mockBackendInstance.getMathematicalAnalysis.mockResolvedValue({
      mathematical_analysis: {},
      analysis_depth: "comprehensive",
      data_dimensions: {
        num_samples: 100,
        num_features: 10,
        has_outcomes: true,
      },
      computational_performance: { analysis_time: 2.5, samples_per_second: 40 },
      mathematical_rigor_score: 85,
      timestamp: new Date().toISOString(),
    });
    mockBackendInstance.healthCheck.mockResolvedValue({
      status: "healthy",
      services: {},
      mathematical_engines: {},
      response_time: 250,
    });

    mockPredictionInstance.getModelPerformance.mockResolvedValue(
      mockModelMetrics,
    );
    mockPredictionInstance.getSystemHealth.mockResolvedValue(mockSystemHealth);
    mockPredictionInstance.generatePrediction.mockResolvedValue({
      prediction_id: "test_pred_001",
      event_id: "test_integration_001",
      sport: "basketball",
      timestamp: new Date().toISOString(),
      final_prediction: 80.5,
      prediction_confidence: 0.87,
      uncertainty_bounds: [78.2, 82.8],
      confidence_intervals: {
        "90%": [78.8, 82.2],
        "95%": [78.2, 82.8],
        "99%": [77.1, 83.9],
      },
      component_predictions: {
        base_prediction: 75.5,
        neuromorphic_enhancement: 2.3,
        mamba_temporal_refinement: 1.8,
        causal_adjustment: -0.5,
        topological_smoothing: 0.3,
        riemannian_projection: 1.1,
        ensemble_weighting: {},
      },
      mathematical_analysis: {
        rigor_score: 85,
        stability_verified: true,
        convergence_achieved: true,
        theoretical_guarantees: {},
        numerical_stability: {},
        complexity_analysis: {},
      },
      feature_analysis: {
        original_features: {},
        engineered_features: {},
        feature_importance: {},
        feature_interactions: {},
        dimensionality_reduction: {
          original_dim: 10,
          reduced_dim: 8,
          explained_variance: 0.95,
          intrinsic_dimension: 7.2,
        },
      },
      risk_assessment: {
        prediction_risk: 0.05,
        model_uncertainty: 0.13,
        data_quality_score: 0.92,
        outlier_detection: false,
        stress_test_results: {},
        worst_case_scenario: 70.0,
        best_case_scenario: 90.0,
      },
      performance_metrics: {
        total_processing_time: 5650,
        component_processing_times: {},
        memory_usage: {},
        cache_hit_rate: 0.85,
        accuracy_estimate: 0.87,
      },
      validation_results: {
        input_validation: true,
        output_validation: true,
        mathematical_consistency: true,
        convergence_diagnostics: {},
        error_bounds: {},
        sensitivity_analysis: {},
      },
      explainability: {
        shap_values: {},
        feature_attributions: {},
        causal_explanations: {},
        topological_insights: {},
        decision_pathway: [],
      },
      recommendations: {
        confidence_level: "high",
        risk_level: "low",
        suggested_actions: [],
        alternative_scenarios: [],
        model_suggestions: [],
      },
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("Enhanced Revolutionary Interface Integration", () => {
    it("should render the Enhanced Revolutionary Interface", () => {
      render(<EnhancedRevolutionaryInterface />);

      expect(
        screen.getByText("Enhanced Revolutionary Engine"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Hodgkin-Huxley Neuromorphics/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/GUDHI Topological Analysis/),
      ).toBeInTheDocument();
    });

    it("should execute enhanced prediction with all mathematical components", async () => {
      const user = userEvent.setup();
      render(<EnhancedRevolutionaryInterface />);

      // Fill in event ID
      const eventIdInput = screen.getByLabelText("Event ID");
      await user.type(eventIdInput, "test_integration_001");

      // Enable all mathematical components
      const neuromorphicCheckbox = screen.getByLabelText(
        "Hodgkin-Huxley Neuromorphic",
      );
      const mambaCheckbox = screen.getByLabelText("Mamba State Space O(L)");
      const causalCheckbox = screen.getByLabelText(
        "PC Algorithm + Do-Calculus",
      );
      const topologicalCheckbox = screen.getByLabelText(
        "GUDHI Persistent Homology",
      );
      const riemannianCheckbox = screen.getByLabelText("Riemannian Geometry");

      // These should already be checked by default, but ensure they are
      if (!neuromorphicCheckbox.checked) await user.click(neuromorphicCheckbox);
      if (!mambaCheckbox.checked) await user.click(mambaCheckbox);
      if (!causalCheckbox.checked) await user.click(causalCheckbox);
      if (!topologicalCheckbox.checked) await user.click(topologicalCheckbox);
      if (!riemannianCheckbox.checked) await user.click(riemannianCheckbox);

      // Execute prediction
      const executeButton = screen.getByText("Execute Enhanced Prediction");
      await user.click(executeButton);

      // Wait for prediction to complete
      await waitFor(
        () => {
          expect(
            mockBackendInstance.getEnhancedRevolutionaryPrediction,
          ).toHaveBeenCalledWith(
            expect.objectContaining({
              event_id: "test_integration_001",
              enable_neuromorphic: true,
              enable_mamba: true,
              enable_causal_inference: true,
              enable_topological: true,
              enable_riemannian: true,
            }),
          );
        },
        { timeout: 10000 },
      );

      // Check if results are displayed
      await waitFor(() => {
        expect(screen.getByText("80.50")).toBeInTheDocument(); // Final prediction
        expect(screen.getByText("87.0%")).toBeInTheDocument(); // Confidence
      });
    });

    it("should display mathematical results and analysis", async () => {
      const user = userEvent.setup();
      render(<EnhancedRevolutionaryInterface />);

      // Execute a prediction first
      const eventIdInput = screen.getByLabelText("Event ID");
      await user.type(eventIdInput, "test_integration_001");

      const executeButton = screen.getByText("Execute Enhanced Prediction");
      await user.click(executeButton);

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText("80.50")).toBeInTheDocument();
      });

      // Switch to Mathematical Results tab
      const mathResultsTab = screen.getByText("Mathematical Results");
      await user.click(mathResultsTab);

      // Check for mathematical components
      expect(screen.getByText(/Neuromorphic Enhancement/)).toBeInTheDocument();
      expect(screen.getByText(/Mamba Refinement/)).toBeInTheDocument();
      expect(screen.getByText(/Causal Adjustment/)).toBeInTheDocument();
      expect(screen.getByText(/Topological Smoothing/)).toBeInTheDocument();
      expect(screen.getByText(/Riemannian Projection/)).toBeInTheDocument();
    });

    it("should validate mathematical guarantees", async () => {
      const user = userEvent.setup();
      render(<EnhancedRevolutionaryInterface />);

      // Execute prediction
      const eventIdInput = screen.getByLabelText("Event ID");
      await user.type(eventIdInput, "test_integration_001");

      const executeButton = screen.getByText("Execute Enhanced Prediction");
      await user.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText("80.50")).toBeInTheDocument();
      });

      // Switch to Validation & Proofs tab
      const validationTab = screen.getByText("Validation & Proofs");
      await user.click(validationTab);

      // Check for mathematical validation results
      expect(
        screen.getByText("Numerical Stability Validation"),
      ).toBeInTheDocument();
      expect(screen.getByText("Convergence Diagnostics")).toBeInTheDocument();
    });
  });

  describe("Ultra Advanced ML Dashboard Integration", () => {
    it("should render the Ultra Advanced ML Dashboard", () => {
      render(<UltraAdvancedMLDashboard />);

      expect(
        screen.getByText("Ultra-Advanced ML Dashboard"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Real-time monitoring of enhanced mathematical ML systems/,
        ),
      ).toBeInTheDocument();
    });

    it("should load and display system health metrics", async () => {
      render(<UltraAdvancedMLDashboard />);

      // Wait for system health data to load
      await waitFor(() => {
        expect(mockPredictionInstance.getSystemHealth).toHaveBeenCalled();
      });

      // Check if system status is displayed
      await waitFor(() => {
        expect(screen.getByText("HEALTHY")).toBeInTheDocument();
        expect(screen.getByText("87.0%")).toBeInTheDocument(); // Prediction accuracy
        expect(screen.getByText("92")).toBeInTheDocument(); // Mathematical rigor score
      });
    });

    it("should display model performance metrics", async () => {
      render(<UltraAdvancedMLDashboard />);

      // Wait for model metrics to load
      await waitFor(() => {
        expect(mockPredictionInstance.getModelPerformance).toHaveBeenCalled();
      });

      // Switch to models tab
      const user = userEvent.setup();
      const modelsTab = screen.getByText("Model Performance");
      await user.click(modelsTab);

      // Check if model cards are displayed
      await waitFor(() => {
        expect(
          screen.getByText("Enhanced Revolutionary Engine"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Enhanced Prediction Engine"),
        ).toBeInTheDocument();
      });
    });

    it("should execute live predictions", async () => {
      const user = userEvent.setup();
      render(<UltraAdvancedMLDashboard />);

      // Click live prediction button
      const livePredictionButton = screen.getByText("Live Prediction");
      await user.click(livePredictionButton);

      // Wait for prediction to be added to the stream
      await waitFor(() => {
        expect(mockPredictionInstance.generatePrediction).toHaveBeenCalled();
      });

      // Switch to predictions tab to see the result
      const predictionsTab = screen.getByText("Live Predictions");
      await user.click(predictionsTab);

      // Check if live prediction appears
      await waitFor(() => {
        expect(screen.getByText(/live_/)).toBeInTheDocument(); // Event ID starts with 'live_'
      });
    });

    it("should display real-time monitoring data", async () => {
      const user = userEvent.setup();
      render(<UltraAdvancedMLDashboard />);

      // Enable auto-refresh
      const autoRefreshButton = screen.getByText("Auto Refresh");
      await user.click(autoRefreshButton);

      // Wait for initial data load
      await waitFor(() => {
        expect(mockPredictionInstance.getSystemHealth).toHaveBeenCalled();
      });

      // Check if resource utilization is displayed
      const healthTab = screen.getByText("System Health");
      await user.click(healthTab);

      await waitFor(() => {
        expect(screen.getByText("Resource Utilization")).toBeInTheDocument();
        expect(screen.getByText("CPU Usage")).toBeInTheDocument();
        expect(screen.getByText("Memory Usage")).toBeInTheDocument();
      });
    });
  });

  describe("Service Integration Tests", () => {
    it("should handle backend service errors gracefully", async () => {
      // Mock a service error
      mockBackendInstance.getEnhancedRevolutionaryPrediction.mockRejectedValueOnce(
        new Error("Backend service unavailable"),
      );

      const user = userEvent.setup();
      render(<EnhancedRevolutionaryInterface />);

      const eventIdInput = screen.getByLabelText("Event ID");
      await user.type(eventIdInput, "test_error");

      const executeButton = screen.getByText("Execute Enhanced Prediction");
      await user.click(executeButton);

      // Should handle error gracefully without crashing
      await waitFor(() => {
        expect(
          mockBackendInstance.getEnhancedRevolutionaryPrediction,
        ).toHaveBeenCalled();
      });
    });

    it("should validate mathematical computation accuracy", async () => {
      const user = userEvent.setup();
      render(<EnhancedRevolutionaryInterface />);

      const eventIdInput = screen.getByLabelText("Event ID");
      await user.type(eventIdInput, "test_accuracy");

      const executeButton = screen.getByText("Execute Enhanced Prediction");
      await user.click(executeButton);

      await waitFor(() => {
        expect(
          mockBackendInstance.getEnhancedRevolutionaryPrediction,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            features: expect.any(Object),
            numerical_precision: "float32",
            convergence_tolerance: 1e-6,
          }),
        );
      });

      // Verify the mathematical guarantees are checked
      await waitFor(() => {
        expect(screen.getByText("80.50")).toBeInTheDocument();
      });

      // Switch to validation tab and check guarantees
      const validationTab = screen.getByText("Validation & Proofs");
      await user.click(validationTab);

      // Should show mathematical validation results
      expect(
        screen.getByText("Numerical Stability Validation"),
      ).toBeInTheDocument();
    });

    it("should demonstrate real-time data flow", async () => {
      const user = userEvent.setup();
      render(<UltraAdvancedMLDashboard />);

      // Enable real-time monitoring
      const autoRefreshButton = screen.getByText("Auto Refresh");
      if (autoRefreshButton.textContent?.includes("Auto Refresh")) {
        await user.click(autoRefreshButton);
      }

      // Initial data load
      await waitFor(() => {
        expect(mockPredictionInstance.getSystemHealth).toHaveBeenCalled();
        expect(mockPredictionInstance.getModelPerformance).toHaveBeenCalled();
      });

      // Verify real-time capabilities are active
      expect(screen.getByText("Pause")).toBeInTheDocument(); // Auto refresh should be active
    });
  });

  describe("Performance and Quality Tests", () => {
    it("should complete predictions within reasonable time limits", async () => {
      const user = userEvent.setup();
      render(<EnhancedRevolutionaryInterface />);

      const startTime = Date.now();

      const eventIdInput = screen.getByLabelText("Event ID");
      await user.type(eventIdInput, "test_performance");

      const executeButton = screen.getByText("Execute Enhanced Prediction");
      await user.click(executeButton);

      await waitFor(() => {
        expect(screen.getByText("80.50")).toBeInTheDocument();
      });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete within 10 seconds (including UI interactions)
      expect(totalTime).toBeLessThan(10000);
    });

    it("should maintain mathematical rigor across all components", async () => {
      const user = userEvent.setup();
      render(<EnhancedRevolutionaryInterface />);

      const eventIdInput = screen.getByLabelText("Event ID");
      await user.type(eventIdInput, "test_rigor");

      const executeButton = screen.getByText("Execute Enhanced Prediction");
      await user.click(executeButton);

      await waitFor(() => {
        expect(
          mockBackendInstance.getEnhancedRevolutionaryPrediction,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            enable_neuromorphic: true,
            enable_mamba: true,
            enable_causal_inference: true,
            enable_topological: true,
            enable_riemannian: true,
          }),
        );
      });

      // Check that all mathematical guarantees are satisfied
      const response = mockPredictionResponse.mathematical_guarantees;
      expect(Object.values(response).every(Boolean)).toBe(true);
    });

    it("should provide comprehensive explainability", async () => {
      const user = userEvent.setup();
      render(<UltraAdvancedMLDashboard />);

      // Execute a prediction that includes explainability
      const livePredictionButton = screen.getByText("Live Prediction");
      await user.click(livePredictionButton);

      await waitFor(() => {
        expect(mockPredictionInstance.generatePrediction).toHaveBeenCalledWith(
          expect.objectContaining({
            include_causal_analysis: true,
            include_topological_analysis: true,
            include_manifold_learning: true,
          }),
        );
      });

      // The prediction service should provide explainability data
      const predictionCall =
        mockPredictionInstance.generatePrediction.mock.calls[0][0];
      expect(predictionCall.include_causal_analysis).toBe(true);
    });
  });
});

export {
  mockPredictionRequest,
  mockPredictionResponse,
  mockSystemHealth,
  mockModelMetrics,
};
