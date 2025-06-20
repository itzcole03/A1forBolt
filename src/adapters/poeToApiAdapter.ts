import { PoeDataBlock, PoePropCardContent, PoeApiResponse } from '@/types';
import { PrizePicksProps } from '../../shared/prizePicks';
import { unifiedMonitor } from '../core/UnifiedMonitor';

/**
 * Adapts data from a "Poe-like" source (structured as PoeDataBlock)
 * into a more usable format, such as PrizePicksProps for prop card display.
 */
export class PoeToApiAdapter {
  constructor() {}

  /**
   * Transforms an array of PoeDataBlock objects into an array of PrizePicksProps.
   * Focuses on blocks of type 'prop_card'.
   *
   * @param poeDataBlocks - An array of PoeDataBlock objects.
   * @returns An array of PrizePicksProps.
   */
  public transformPoeDataToPrizePicksProps(poeDataBlocks: PoeDataBlock[]): PrizePicksProps[] {
    const trace = unifiedMonitor.startTrace(
      'PoeToApiAdapter.transformPoeData',
      'adapter.transform'
    );
    const transformedProps: PrizePicksProps[] = [];

    try {
      for (const block of poeDataBlocks) {
        if (block.type === 'prop_card' && block.content) {
          const content = block.content as PoePropCardContent;
          // Basic mapping, assuming PoePropCardContent fields align or can be mapped
          const prop: PrizePicksProps = {
            playerId: content.playerId || block.id,
            id: block.id, // Use PoeDataBlock id as the prop id
            league: content.statType.includes('NBA')
              ? 'NBA'
              : content.statType.includes('NFL')
                ? 'NFL'
                : 'Unknown', // Crude league detection
            player_name: content.playerName,
            stat_type: content.statType,
            line_score: content.line,
            description: `${content.playerName} - ${content.statType} ${content.line}`,
            image_url: content.playerImage,
            overOdds: content.overOdds,
            underOdds: content.underOdds,
            // start_time, status would need to come from PoeDataBlock metadata or extended content
            // For now, these are example transformations
          };
          transformedProps.push(prop);
        }
      }
      unifiedMonitor.endTrace(trace);
      return transformedProps;
    } catch (error) {
      unifiedMonitor.reportError(error, { operation: 'transformPoeDataToPrizePicksProps' });
      unifiedMonitor.endTrace(trace);
      throw error;
    }
  }

  /**
   * Simulates fetching data from a Poe-like API and transforming it.
   * @returns A promise that resolves to an array of PrizePicksProps.
   */
  public async fetchAndTransformPoeData(): Promise<PrizePicksProps[]> {
    console.warn('[PoeToApiAdapter] Fetching and transforming MOCK Poe data.');
    // Simulate API response
    const mockPoeApiResponse: PoeApiResponse = {
      requestId: `mockReq_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dataBlocks: [
        {
          id: 'poe_prop_1',
          type: 'prop_card',
          title: 'LeBron James Points',
          content: {
            playerId: 'lebron_james_01',
            playerName: 'LeBron James',
            playerImage: 'https://a.espncdn.com/i/headshots/nba/players/full/1966.png',
            statType: 'Points (NBA)',
            line: 25.5,
            overOdds: -115,
            underOdds: -105,
            lastUpdated: new Date().toISOString(),
          } as PoePropCardContent,
          metadata: { source: 'PoeMockService' },
        },
        {
          id: 'poe_prop_2',
          type: 'prop_card',
          title: 'Patrick Mahomes Passing Yards',
          content: {
            playerId: 'patrick_mahomes_01',
            playerName: 'Patrick Mahomes',
            statType: 'Passing Yards (NFL)',
            line: 285.5,
            overOdds: -110,
            underOdds: -110,
            lastUpdated: new Date().toISOString(),
          } as PoePropCardContent,
          metadata: { source: 'PoeMockService' },
        },
        {
          id: 'poe_news_1',
          type: 'news_feed',
          title: 'General Sports News',
          content: { articles: [] }, // Placeholder, not transformed by this method
          metadata: { source: 'PoeMockService' },
        },
      ],
    };

    return this.transformPoeDataToPrizePicksProps(mockPoeApiResponse.dataBlocks);
  }
}

// Export a singleton instance if preferred, or allow instantiation
export const poeToApiAdapter = new PoeToApiAdapter();
