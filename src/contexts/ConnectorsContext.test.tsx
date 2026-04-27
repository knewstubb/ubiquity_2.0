import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ToastProvider } from '../components/shared/Toast';
import { DataLayerProvider } from '../providers/DataLayerProvider';
import { ConnectorsProvider, useConnectors } from './ConnectorsContext';
import type { WizardDraft } from '../models/wizard';
import { DEFAULT_FORMAT_OPTIONS, DEFAULT_FILTERS, DEFAULT_FILE_NAMING_PATTERN } from '../models/wizard';

const STORAGE_KEY = 'ubiquity-connectors';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DataLayerProvider>
        <ConnectorsProvider>{children}</ConnectorsProvider>
      </DataLayerProvider>
    </ToastProvider>
  );
}

function makeDraft(overrides: Partial<WizardDraft> = {}): WizardDraft {
  return {
    connectionId: 'conn-1',
    name: 'Test Connector',
    dataType: 'contact',
    transactionalSource: null,
    enrichmentKeyField: null,
    selectedFields: [{ key: 'firstName', label: 'First Name', source: 'contact' }],
    fileType: 'csv',
    formatOptions: { ...DEFAULT_FORMAT_OPTIONS },
    fileNamingPattern: DEFAULT_FILE_NAMING_PATTERN,
    schedule: 'daily',
    filters: { ...DEFAULT_FILTERS },
    ...overrides,
  };
}

describe('ConnectorsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty connectors when localStorage is empty', () => {
    const { result } = renderHook(() => useConnectors(), { wrapper });
    expect(result.current.connectors).toEqual([]);
  });

  it('throws when useConnectors is used outside provider', () => {
    expect(() => {
      renderHook(() => useConnectors());
    }).toThrow('useConnectors must be used within a ConnectorsProvider');
  });

  describe('addConnector', () => {
    it('creates a connector from a draft with generated ID and timestamps', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });
      const draft = makeDraft();

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(draft);
      });

      expect(connector!.id).toBeTruthy();
      expect(connector!.connectionId).toBe('conn-1');
      expect(connector!.name).toBe('Test Connector');
      expect(connector!.direction).toBe('export');
      expect(connector!.dataType).toBe('contact');
      expect(connector!.status).toBe('active');
      expect(connector!.createdAt).toBeTruthy();
      expect(connector!.updatedAt).toBeTruthy();
      expect(connector!.selectedFields).toEqual(draft.selectedFields);
      expect(connector!.formatOptions).toEqual(draft.formatOptions);
      expect(connector!.schedule).toBe('daily');
      expect(result.current.connectors).toHaveLength(1);
    });

    it('includes transactionalSource when present in draft', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });
      const draft = makeDraft({ dataType: 'transactional', transactionalSource: 'treatments' });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(draft);
      });

      expect(connector!.transactionalSource).toBe('treatments');
    });

    it('omits transactionalSource when null in draft', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(makeDraft());
      });

      expect(connector!.transactionalSource).toBeUndefined();
    });

    it('persists fileType, fileNamingPattern, and filters from draft', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });
      const draft = makeDraft({
        fileType: 'json',
        fileNamingPattern: '{connector_name}_{timestamp}',
        filters: { combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] },
      });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(draft);
      });

      expect(connector!.fileType).toBe('json');
      expect(connector!.fileNamingPattern).toBe('{connector_name}_{timestamp}');
      expect(connector!.filters).toEqual({ combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] });
    });

    it('persists enrichmentKeyField when present in draft', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });
      const draft = makeDraft({
        dataType: 'transactional_with_contact',
        transactionalSource: 'treatments',
        enrichmentKeyField: 'customerId',
      });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(draft);
      });

      expect(connector!.enrichmentKeyField).toBe('customerId');
    });

    it('omits enrichmentKeyField when null in draft', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(makeDraft());
      });

      expect(connector!.enrichmentKeyField).toBeUndefined();
    });
  });

  describe('updateConnector', () => {
    it('updates connector fields while preserving id and createdAt', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(makeDraft());
      });

      const updatedDraft = makeDraft({ name: 'Updated Name', schedule: 'hourly' });
      act(() => {
        result.current.updateConnector(connector!.id, updatedDraft);
      });

      const updated = result.current.connectors[0];
      expect(updated.id).toBe(connector!.id);
      expect(updated.createdAt).toBe(connector!.createdAt);
      expect(updated.name).toBe('Updated Name');
      expect(updated.schedule).toBe('hourly');
      expect(updated.updatedAt).toBeTruthy();
      expect(new Date(updated.updatedAt).toISOString()).toBe(updated.updatedAt);
    });

    it('updates new fields (fileType, fileNamingPattern, enrichmentKeyField, filters)', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(makeDraft());
      });

      const updatedDraft = makeDraft({
        fileType: 'xml',
        fileNamingPattern: '{connector_name}_{date}_{timestamp}',
        enrichmentKeyField: 'customerId',
        filters: { combinator: 'OR', rules: [{ field: 'status', operator: 'equals', value: 'active' }], groups: [] },
      });
      act(() => {
        result.current.updateConnector(connector!.id, updatedDraft);
      });

      const updated = result.current.connectors[0];
      expect(updated.fileType).toBe('xml');
      expect(updated.fileNamingPattern).toBe('{connector_name}_{date}_{timestamp}');
      expect(updated.enrichmentKeyField).toBe('customerId');
      expect(updated.filters).toEqual({ combinator: 'OR', rules: [{ field: 'status', operator: 'equals', value: 'active' }], groups: [] });
    });
  });

  describe('toggleConnectorStatus', () => {
    it('toggles active to paused', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(makeDraft());
      });

      act(() => {
        result.current.toggleConnectorStatus(connector!.id);
      });

      expect(result.current.connectors[0].status).toBe('paused');
    });

    it('toggles paused back to active', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(makeDraft());
      });

      act(() => {
        result.current.toggleConnectorStatus(connector!.id);
      });
      act(() => {
        result.current.toggleConnectorStatus(connector!.id);
      });

      expect(result.current.connectors[0].status).toBe('active');
    });
  });

  describe('deleteConnector', () => {
    it('removes the connector from state', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });

      let connector: ReturnType<typeof result.current.addConnector>;
      act(() => {
        connector = result.current.addConnector(makeDraft());
      });

      expect(result.current.connectors).toHaveLength(1);

      act(() => {
        result.current.deleteConnector(connector!.id);
      });

      expect(result.current.connectors).toHaveLength(0);
    });
  });

  describe('localStorage persistence', () => {
    it('persists connectors to localStorage on add', () => {
      const { result } = renderHook(() => useConnectors(), { wrapper });

      act(() => {
        result.current.addConnector(makeDraft());
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Test Connector');
    });

    it('restores connectors from localStorage on init', () => {
      const existing = [{
        id: 'existing-id',
        connectionId: 'conn-1',
        name: 'Persisted Connector',
        direction: 'export',
        dataType: 'contact',
        selectedFields: [],
        fileType: 'csv',
        formatOptions: { ...DEFAULT_FORMAT_OPTIONS },
        fileNamingPattern: '{connector_name}_{date}',
        schedule: 'daily',
        filters: { combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] },
        status: 'active',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

      const { result } = renderHook(() => useConnectors(), { wrapper });
      expect(result.current.connectors).toHaveLength(1);
      expect(result.current.connectors[0].name).toBe('Persisted Connector');
    });

    it('falls back to empty array on corrupted localStorage data', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');

      const { result } = renderHook(() => useConnectors(), { wrapper });
      expect(result.current.connectors).toEqual([]);
    });

    it('falls back to empty array when localStorage contains non-array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));

      const { result } = renderHook(() => useConnectors(), { wrapper });
      expect(result.current.connectors).toEqual([]);
    });
  });
});
