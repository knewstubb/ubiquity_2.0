import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { mapConnectorToRow, mapRowToConnector } from '../lib/adapters/connectors-adapter'
import type { ImporterConfig } from '../models/importer'
import type { Automation } from '../models/automation'

/**
 * Feature: connector-data-persistence, Property 1: ImporterConfig round-trip serialization
 *
 * For any valid ImporterConfig object (with arbitrary ContactConfig, TransactionalConfig,
 * FieldMapping[], and NotificationConfig values), serializing it to the Supabase row format
 * via mapConnectorToRow and deserializing back via mapRowToConnector SHALL produce an object
 * deeply equal to the original.
 *
 * **Validates: Requirements 1.2, 2.2, 3.3, 4.2, 5.1, 5.2**
 */

// --- Arbitraries ---

const arbUpdateType = fc.constantFrom('append-update' as const, 'append' as const, 'update' as const)
const arbBlankValueHandling = fc.constantFrom('preserve' as const, 'import' as const)
const arbPathMode = fc.constantFrom('automatic' as const, 'base' as const, 'custom' as const)
const arbImportDataType = fc.constantFrom('contact' as const, 'transactional' as const, 'both' as const)

const arbContactConfig = fc.record({
  updateType: arbUpdateType,
  blankValueHandling: arbBlankValueHandling,
  matchingFields: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 }),
})

const arbTransactionalConfig = fc.record({
  updateType: arbUpdateType,
  blankValueHandling: arbBlankValueHandling,
  matchingFields: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 5 }),
})

const arbFieldMapping = fc.record({
  sourceField: fc.string({ minLength: 1, maxLength: 50 }),
  targetField: fc.string({ minLength: 1, maxLength: 50 }),
})

const arbNotificationConfig = fc.record({
  failureEmails: fc.array(fc.emailAddress(), { minLength: 0, maxLength: 3 }),
  successEnabled: fc.boolean(),
  successEmails: fc.array(fc.emailAddress(), { minLength: 0, maxLength: 3 }),
  noFileAlertEnabled: fc.boolean(),
  noFileAlertEmails: fc.array(fc.emailAddress(), { minLength: 0, maxLength: 3 }),
})

const arbFilePathConfig = fc.record({
  pathMode: arbPathMode,
  folderName: fc.string({ minLength: 0, maxLength: 50 }),
  readPath: fc.string({ minLength: 0, maxLength: 100 }),
  errorFolderPath: fc.string({ minLength: 0, maxLength: 100 }),
  archiveFolderPath: fc.string({ minLength: 0, maxLength: 100 }),
  fileNamePattern: fc.string({ minLength: 0, maxLength: 50 }),
})

const arbImporterConfig: fc.Arbitrary<ImporterConfig> = fc.record({
  connectionId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  dataType: fc.oneof(arbImportDataType, fc.constant(null)),
  filePathConfig: arbFilePathConfig,
  notifications: arbNotificationConfig,
  contactConfig: arbContactConfig,
  contactMapping: fc.array(arbFieldMapping, { minLength: 0, maxLength: 10 }),
  transactionalConfig: arbTransactionalConfig,
  transactionalMapping: fc.array(arbFieldMapping, { minLength: 0, maxLength: 10 }),
})

// Minimal valid Automation shell for round-tripping
function buildAutomation(importerConfig: ImporterConfig): Automation {
  return {
    id: 'test-id',
    connectionId: 'conn-id',
    name: 'Test Automation',
    direction: 'import',
    dataType: 'contact',
    selectedFields: [],
    fileType: 'csv',
    formatOptions: {
      delimiter: ',',
      includeHeader: true,
      dateFormat: 'ISO8601',
      timezone: 'UTC',
    },
    fileNamingPattern: '{name}_{date}',
    schedule: 'daily',
    filters: { combinator: 'AND', rules: [], groups: [] },
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    importerConfig,
  }
}

describe('Feature: connector-data-persistence, Property 1: ImporterConfig round-trip serialization', () => {
  it('round-tripping ImporterConfig through mapConnectorToRow and mapRowToConnector preserves deep equality', () => {
    fc.assert(
      fc.property(arbImporterConfig, (importerConfig) => {
        const automation = buildAutomation(importerConfig)

        // Serialize to row format
        const row = mapConnectorToRow(automation)

        // Deserialize back
        const restored = mapRowToConnector(row)

        // Assert the importerConfig survived the round-trip
        expect(restored.importerConfig).toEqual(importerConfig)
      }),
      { numRuns: 100 }
    )
  })
})
