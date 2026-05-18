import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import type { ImporterConfig } from '../models/importer'

/**
 * Feature: csv-sample-upload, Property 4: ImporterConfig serialization round-trip
 *
 * For any valid ImporterConfig object containing csvHeaders, csvExampleValues, and
 * lookupMappings fields, serializing to JSON and deserializing back SHALL produce a
 * deeply equal object (all fields, nested arrays, and record entries identical in
 * value and order).
 *
 * **Validates: Requirements 3.2, 3.3, 3.6, 5.5, 5.7**
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

const arbLookupMapping = fc.record({
  sourceField: fc.string({ minLength: 1, maxLength: 255 }),
  contactField: fc.string({ minLength: 1, maxLength: 255 }),
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

// CSV header: non-empty string, 1-255 chars
const arbCsvHeader = fc.string({ minLength: 1, maxLength: 255 })

// Generate csvHeaders and matching csvExampleValues
const arbCsvData = fc
  .array(arbCsvHeader, { minLength: 0, maxLength: 1000 })
  .chain((headers) => {
    const arbValues = fc.record(
      Object.fromEntries(
        headers.map((h) => [h, fc.string({ minLength: 0, maxLength: 1000 })])
      )
    )
    return headers.length > 0
      ? arbValues.map((values) => ({ headers, values }))
      : fc.constant({ headers, values: {} as Record<string, string> })
  })

const arbImporterConfig: fc.Arbitrary<ImporterConfig> = arbCsvData.chain(({ headers, values }) =>
  fc.record({
    connectionId: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    dataType: fc.oneof(arbImportDataType, fc.constant(null)),
    filePathConfig: arbFilePathConfig,
    notifications: arbNotificationConfig,
    contactConfig: arbContactConfig,
    contactMapping: fc.array(arbFieldMapping, { minLength: 0, maxLength: 10 }),
    transactionalConfig: arbTransactionalConfig,
    transactionalMapping: fc.array(arbFieldMapping, { minLength: 0, maxLength: 10 }),
    csvHeaders: fc.constant(headers),
    csvExampleValues: fc.constant(values),
    lookupMappings: fc.array(arbLookupMapping, { minLength: 0, maxLength: 10 }),
  })
)

describe('Feature: csv-sample-upload, Property 4: ImporterConfig serialization round-trip', () => {
  it('JSON.parse(JSON.stringify(config)) produces a deeply equal object', () => {
    fc.assert(
      fc.property(arbImporterConfig, (config) => {
        const serialized = JSON.stringify(config)
        const deserialized = JSON.parse(serialized)

        expect(deserialized).toEqual(config)
      }),
      { numRuns: 20 }
    )
  })
})
