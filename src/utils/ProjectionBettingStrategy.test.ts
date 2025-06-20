import { Recommendation } from "../core/PredictionEngine";
import { ProjectionBettingStrategy, ProjectionPlugin } from "./ProjectionBettingStrategy";

describe("ProjectionBettingStrategy", () => {
    const baseConfig = {
        minConfidence: 0.5,
        minEdge: 0.05,
        maxRisk: 0.2,
        useHistoricalData: false,
        useAdvancedStats: false,
    };

    const sampleProjections = {
        "player1": {
            confidence: 0.7,
            stats: {
                team: "A",
                position: "G",
                opponent: "B",
                isHome: true,
                points: 25,
                rebounds: 5,
                assists: 7,
                steals: 2,
                blocks: 1,
                threes: 3,
                minutes: 35,
            },
        },
        "player2": {
            confidence: 0.4,
            stats: {
                team: "C",
                position: "F",
                opponent: "D",
                isHome: false,
                points: 10,
                rebounds: 8,
                assists: 2,
                steals: 1,
                blocks: 0,
                threes: 1,
                minutes: 28,
            },
        },
    };

    const sampleData = {
        historical: [],
        market: [],
        correlations: [],
        metadata: {},
        projections: sampleProjections,
        odds: {
            "player1": { movement: { magnitude: 0.2 } },
            "player2": { movement: { magnitude: 0.6 } },
        },
        sentiment: [{}, {}],
        injuries: { "player1": { impact: 0.1 }, "player2": { impact: 0.5 } },
        trends: { "player1": {}, "player2": {} },
        timestamp: Date.now(),
    };

    it("should produce a valid decision and recommendations", async () => {
        const strat = new ProjectionBettingStrategy(baseConfig);
        const decision = await strat.analyze(sampleData);
        expect(decision).toHaveProperty("recommendations");
        expect(Array.isArray(decision.recommendations)).toBe(true);
        expect(decision.recommendations.length).toBeGreaterThan(0);
        // @ts-expect-error: risk_reasoning is an extension for future-proofing
        expect(decision.analysis).toHaveProperty("risk_reasoning");
        // @ts-expect-error: risk_reasoning is an extension for future-proofing
        expect(Array.isArray(decision.analysis.risk_reasoning)).toBe(true);
    });

    it("should filter out low-confidence projections", async () => {
        const strat = new ProjectionBettingStrategy({ ...baseConfig, minConfidence: 0.8 });
        const decision = await strat.analyze(sampleData);
        expect(decision.recommendations.length).toBe(0);
    });

    it("should allow plugin extension for new stat types (type-safe)", async () => {
        const customPlugin: ProjectionPlugin = {
            statType: "points",
            evaluate: (projection, config) => {
                if (projection.player === "player1") {
                    return [{
                        id: "custom-1",
                        type: "OVER",
                        confidence: 0.99,
                        reasoning: ["Custom logic"],
                        supporting_data: { historical_data: [], market_data: [], correlation_data: [] },
                    }];
                }
                return [];
            },
        };
        const strat = new ProjectionBettingStrategy(baseConfig, [customPlugin]);
        const decision = await strat.analyze(sampleData);
        expect(decision.recommendations.some(r => r.id === "custom-1")).toBe(true);
    });

    it("should memoize edge calculations for identical recommendations", () => {
        const strat = new ProjectionBettingStrategy(baseConfig);
        const rec: Recommendation = {
            id: "rec-1",
            type: "OVER",
            confidence: 0.7,
            reasoning: ["Test"],
            supporting_data: { historical_data: [], market_data: [], correlation_data: [] },
        };
        const edge1 = strat["calculateEdge"](rec);
        const edge2 = strat["calculateEdge"](rec);
        expect(edge1).toBe(edge2);
    });
});
