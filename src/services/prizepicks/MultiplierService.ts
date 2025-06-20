import { z } from 'zod';
import { UnifiedLogger } from '../../core/logging/types';
import { UnifiedMetrics } from '../../core/metrics/types';

// Validation schemas
const propSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  statType: z.string(),
  line: z.number(),
  type: z.enum(['goblin', 'normal', 'demon']),
  multiplier: z.number().min(1),
  confidence: z.number().min(0).max(100),
  timestamp: z.date(),
});

const lineupSchema = z.object({
  id: z.string(),
  props: z.array(propSchema),
  totalMultiplier: z.number().min(1),
  totalStake: z.number().min(0),
  potentialPayout: z.number().min(0),
  timestamp: z.date(),
});

type Prop = z.infer<typeof propSchema>;
type Lineup = z.infer<typeof lineupSchema>;

export class PrizePicksMultiplierService {
  private readonly BASE_MULTIPLIERS = {
    goblin: 1.5,
    normal: 1.0,
    demon: 2.0,
  };

  private readonly MAX_PROPS = 5;
  private readonly MIN_PROPS = 2;
  private readonly MAX_TOTAL_MULTIPLIER = 10;

  constructor(
    private logger: UnifiedLogger,
    private metrics: UnifiedMetrics
  ) {}

  public calculatePropMultiplier(prop: Prop): number {
    try {
      // Validate prop
      propSchema.parse(prop);

      // Get base multiplier
      const baseMultiplier = this.BASE_MULTIPLIERS[prop.type];

      // Apply confidence adjustment
      const confidenceMultiplier = 1 + prop.confidence / 100;

      // Calculate final multiplier
      const finalMultiplier = baseMultiplier * confidenceMultiplier;

      // Track metric
      this.metrics.gauge('prizepicks.prop_multiplier', finalMultiplier, {
        type: prop.type,
        statType: prop.statType,
      });

      return finalMultiplier;
    } catch (error) {
      this.logger.error('Failed to calculate prop multiplier', { error, prop });
      throw error;
    }
  }

  public calculateLineupMultiplier(lineup: Lineup): number {
    try {
      // Validate lineup
      lineupSchema.parse(lineup);

      // Check prop count
      if (lineup.props.length < this.MIN_PROPS || lineup.props.length > this.MAX_PROPS) {
        throw new Error(`Invalid prop count: ${lineup.props.length}`);
      }

      // Calculate total multiplier
      const totalMultiplier = lineup.props.reduce((acc, prop) => {
        return acc * this.calculatePropMultiplier(prop);
      }, 1);

      // Check max multiplier
      if (totalMultiplier > this.MAX_TOTAL_MULTIPLIER) {
        throw new Error(`Total multiplier exceeds maximum: ${totalMultiplier}`);
      }

      // Track metric
      this.metrics.gauge('prizepicks.lineup_multiplier', totalMultiplier, {
        propCount: lineup.props.length,
      });

      return totalMultiplier;
    } catch (error) {
      this.logger.error('Failed to calculate lineup multiplier', { error, lineup });
      throw error;
    }
  }

  public validateLineup(lineup: Lineup): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      // Validate schema
      lineupSchema.parse(lineup);

      // Check prop count
      if (lineup.props.length < this.MIN_PROPS) {
        errors.push(`Minimum ${this.MIN_PROPS} props required`);
      }
      if (lineup.props.length > this.MAX_PROPS) {
        errors.push(`Maximum ${this.MAX_PROPS} props allowed`);
      }

      // Check total multiplier
      const totalMultiplier = this.calculateLineupMultiplier(lineup);
      if (totalMultiplier > this.MAX_TOTAL_MULTIPLIER) {
        errors.push(
          `Total multiplier ${totalMultiplier} exceeds maximum ${this.MAX_TOTAL_MULTIPLIER}`
        );
      }

      // Check stake
      if (lineup.totalStake <= 0) {
        errors.push('Invalid stake amount');
      }

      // Check potential payout
      const expectedPayout = lineup.totalStake * totalMultiplier;
      if (Math.abs(lineup.potentialPayout - expectedPayout) > 0.01) {
        errors.push('Potential payout calculation mismatch');
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      this.logger.error('Lineup validation failed', { error, lineup });
      return {
        isValid: false,
        errors: ['Invalid lineup format'],
      };
    }
  }
}
