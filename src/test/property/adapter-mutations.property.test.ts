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
 * In-memory store simulating the adapter pattern.
 * Provides create, read (by ID), update, delete, and list operations
 * over a simple Map keyed by object ID.
 */
class InMemoryStore<T extends { id: string }> {
  private store = new Map<string, T>();

  create(obj: T): T {
    this.store.set(obj.id, structuredClone(obj));
    return structuredClone(obj);
  }

  getById(id: string): T | undefined {
    const item = this.store.get(id);
    return item ? structuredClone(item) : undefined;
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const existing = this.store.get(id);
    if (!existing) return undefined;
    const updated = { ...structuredClone(existing), ...updates, id }; // id is immutable
    this.store.set(id, updated);
    return structuredClone(updated);
  }

  delete(id: string): boolean {
    return this.store.delete(id);
  }

  getAll(): T[] {
    return [...this.store.values()].map((v) => structuredClone(v));
  }
}


/**
 * Property 2: Mutations are reflected in subsequent reads
 *
 * For any valid domain object and any supported mutation (create, update, delete),
 * after the mutation completes, a subsequent read reflects the change:
 * - Created objects are findable by ID
 * - Updated fields match the applied updates
 * - Deleted objects are absent
 *
 * Uses an in-memory Map to simulate the adapter pattern's logical contract,
 * not actual Supabase calls.
 *
 * **Validates: Requirements 1.3**
 */
describe('Property 2: Mutations are reflected in subsequent reads', () => {
  // --- Connections ---

  it('connections: after create, the object is findable by ID', () => {
    fc.assert(
      fc.property(arbConnection(), (connection) => {
        const store = new InMemoryStore<Connection>();
        store.create(connection);
        const found = store.getById(connection.id);
        expect(found).toEqual(connection);
      }),
      { numRuns: 200 },
    );
  });

  it('connections: after update, the updated fields match', () => {
    fc.assert(
      fc.property(
        arbConnection(),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        (connection, newName) => {
          const store = new InMemoryStore<Connection>();
          store.create(connection);
          store.update(connection.id, { name: newName });
          const found = store.getById(connection.id);
          expect(found).toBeDefined();
          expect(found!.name).toBe(newName);
          // Other fields remain unchanged
          expect(found!.id).toBe(connection.id);
          expect(found!.protocol).toBe(connection.protocol);
          expect(found!.status).toBe(connection.status);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('connections: after delete, the object is absent', () => {
    fc.assert(
      fc.property(arbConnection(), (connection) => {
        const store = new InMemoryStore<Connection>();
        store.create(connection);
        expect(store.getById(connection.id)).toBeDefined();
        store.delete(connection.id);
        expect(store.getById(connection.id)).toBeUndefined();
      }),
      { numRuns: 200 },
    );
  });

  // --- Segments ---

  it('segments: after create, the object is findable by ID', () => {
    fc.assert(
      fc.property(arbSegment(), (segment) => {
        const store = new InMemoryStore<Segment>();
        store.create(segment);
        const found = store.getById(segment.id);
        expect(found).toEqual(segment);
      }),
      { numRuns: 200 },
    );
  });

  it('segments: after update, the updated fields match', () => {
    fc.assert(
      fc.property(
        arbSegment(),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.nat({ max: 10000 }),
        (segment, newName, newMemberCount) => {
          const store = new InMemoryStore<Segment>();
          store.create(segment);
          store.update(segment.id, { name: newName, memberCount: newMemberCount });
          const found = store.getById(segment.id);
          expect(found).toBeDefined();
          expect(found!.name).toBe(newName);
          expect(found!.memberCount).toBe(newMemberCount);
          // Other fields remain unchanged
          expect(found!.id).toBe(segment.id);
          expect(found!.accountId).toBe(segment.accountId);
          expect(found!.type).toBe(segment.type);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('segments: after delete, the object is absent', () => {
    fc.assert(
      fc.property(arbSegment(), (segment) => {
        const store = new InMemoryStore<Segment>();
        store.create(segment);
        expect(store.getById(segment.id)).toBeDefined();
        store.delete(segment.id);
        expect(store.getById(segment.id)).toBeUndefined();
      }),
      { numRuns: 200 },
    );
  });

  // --- Assets ---

  it('assets: after create, the object is findable by ID', () => {
    fc.assert(
      fc.property(arbAssetLocal(), (asset) => {
        const store = new InMemoryStore<Asset>();
        store.create(asset);
        const found = store.getById(asset.id);
        expect(found).toEqual(asset);
      }),
      { numRuns: 200 },
    );
  });

  it('assets: after update, the updated fields match', () => {
    fc.assert(
      fc.property(
        arbAssetLocal(),
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
        fc.constantFrom<AssetType>(...ASSET_TYPES),
        (asset, newName, newType) => {
          const store = new InMemoryStore<Asset>();
          store.create(asset);
          store.update(asset.id, { name: newName, type: newType });
          const found = store.getById(asset.id);
          expect(found).toBeDefined();
          expect(found!.name).toBe(newName);
          expect(found!.type).toBe(newType);
          // Other fields remain unchanged
          expect(found!.id).toBe(asset.id);
          expect(found!.scope).toBe(asset.scope);
          expect(found!.accountId).toBe(asset.accountId);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('assets: after delete, the object is absent', () => {
    fc.assert(
      fc.property(arbAssetLocal(), (asset) => {
        const store = new InMemoryStore<Asset>();
        store.create(asset);
        expect(store.getById(asset.id)).toBeDefined();
        store.delete(asset.id);
        expect(store.getById(asset.id)).toBeUndefined();
      }),
      { numRuns: 200 },
    );
  });

  // --- Mixed mutation sequences ---

  it('connections: random create/update/delete sequence is consistent', () => {
    fc.assert(
      fc.property(
        fc.array(arbConnection(), { minLength: 1, maxLength: 10 }),
        (connections) => {
          const store = new InMemoryStore<Connection>();

          // Create all
          for (const conn of connections) {
            store.create(conn);
          }

          // All should be findable
          for (const conn of connections) {
            expect(store.getById(conn.id)).toEqual(conn);
          }

          // Delete the first one
          const [first, ...rest] = connections;
          store.delete(first.id);
          expect(store.getById(first.id)).toBeUndefined();

          // Rest should still be findable
          for (const conn of rest) {
            expect(store.getById(conn.id)).toEqual(conn);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
