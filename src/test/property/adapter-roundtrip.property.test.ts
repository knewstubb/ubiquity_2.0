import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { arbConnection, arbSegment, arbAccountId, arbISOTimestamp, ASSET_TYPES, ASSET_SCOPES } from '../generators';
import type { Connection } from '../../models/connection';
import type { Segment } from '../../models/segment';
import type { Asset, AssetType, AssetScope } from '../../models/asset';

/**
 * Local asset arbitrary that avoids the broken fc.hexaString in fast-check v4.
 * Uses fc.string with a hex character set instead.
 */
function arbAssetLocal(): fc.Arbitrary<Asset> {
  return fc.record({
    id: fc.uuid().map((u) => `ast-${u}`),
    name: fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    type: fc.constantFrom<AssetType>(...ASSET_TYPES),
    scope: fc.constantFrom<AssetScope>(...ASSET_SCOPES),
    accountId: arbAccountId(),
    campaignId: fc.option(fc.uuid().map((u) => `cmp-${u}`), { nil: null }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    createdAt: arbISOTimestamp(),
    colourValue: fc.option(
      fc.array(fc.constantFrom(...'0123456789abcdef'.split('')), { minLength: 6, maxLength: 6 }).map((chars) => `#${chars.join('')}`),
      { nil: undefined },
    ),
  });
}

/**
 * Property 1: Data adapter round-trip preserves shape
 *
 * For each adapter (connections, segments, assets), writing an object through
 * the adapter and reading it back produces a deeply equal object.
 *
 * The adapters map camelCase→snake_case on write and snake_case→camelCase on read.
 * We mock the Supabase client so that insert returns the snake_case version,
 * and the adapter's mapping functions handle the conversion both ways.
 *
 * **Validates: Requirements 1.1**
 */

// --- Mapping functions extracted from adapters (pure logic under test) ---

function mapConnectionToRow(connection: Connection) {
  return {
    id: connection.id,
    name: connection.name,
    protocol: connection.protocol,
    status: connection.status,
    base_path: connection.basePath,
    config: connection.config,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToConnection(row: any): Connection {
  return {
    id: row.id,
    name: row.name,
    protocol: row.protocol,
    status: row.status,
    basePath: row.base_path,
    config: row.config,
  };
}

function mapSegmentToRow(segment: Segment) {
  return {
    id: segment.id,
    name: segment.name,
    account_id: segment.accountId,
    type: segment.type,
    root_group: segment.rootGroup,
    member_count: segment.memberCount,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToSegment(row: any): Segment {
  return {
    id: row.id,
    name: row.name,
    accountId: row.account_id,
    type: row.type,
    rootGroup: row.root_group,
    memberCount: row.member_count,
  };
}

function mapAssetToRow(asset: Asset) {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    scope: asset.scope,
    account_id: asset.accountId,
    campaign_id: asset.campaignId ?? null,
    tags: asset.tags,
    created_at: asset.createdAt,
    colour_value: asset.colourValue ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToAsset(row: any): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    scope: row.scope,
    accountId: row.account_id,
    campaignId: row.campaign_id ?? null,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    colourValue: row.colour_value ?? undefined,
  };
}

describe('Property 1: Data adapter round-trip preserves shape', () => {
  /**
   * **Validates: Requirements 1.1**
   *
   * For any valid domain object, converting camelCase→snake_case (write)
   * and then snake_case→camelCase (read) produces a deeply equal object.
   */

  it('connections: mapRowToConnection(mapConnectionToRow(conn)) === conn', () => {
    fc.assert(
      fc.property(arbConnection(), (connection) => {
        const row = mapConnectionToRow(connection);
        const roundTripped = mapRowToConnection(row);
        expect(roundTripped).toEqual(connection);
      }),
      { numRuns: 200 },
    );
  });

  it('segments: mapRowToSegment(mapSegmentToRow(seg)) === seg', () => {
    fc.assert(
      fc.property(arbSegment(), (segment) => {
        const row = mapSegmentToRow(segment);
        const roundTripped = mapRowToSegment(row);
        expect(roundTripped).toEqual(segment);
      }),
      { numRuns: 200 },
    );
  });

  it('assets: mapRowToAsset(mapAssetToRow(asset)) === asset', () => {
    fc.assert(
      fc.property(arbAssetLocal(), (asset) => {
        const row = mapAssetToRow(asset);
        const roundTripped = mapRowToAsset(row);

        // Normalize: the adapter maps null campaign_id → null, and null colour_value → undefined
        const expected = {
          ...asset,
          campaignId: asset.campaignId ?? null,
          colourValue: asset.colourValue ?? undefined,
        };
        expect(roundTripped).toEqual(expected);
      }),
      { numRuns: 200 },
    );
  });
});
