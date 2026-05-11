import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ToastProvider } from '../components/shared/Toast';
import { DataLayerProvider } from '../providers/DataLayerProvider';
import { AutomationsProvider, useAutomations } from './AutomationsContext';
import type { WizardDraft } from '../models/wizard';
import { DEFAULT_FORMAT_OPTIONS, DEFAULT_FILTERS, DEFAULT_FILE_NAMING_PATTERN } from '../models/wizard';

const STORAGE_KEY = 'ubiquity-automations';

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DataLayerProvider>
        <AutomationsProvider>{children}</AutomationsProvider>
      </DataLayerProvider>
    </ToastProvider>
  );
}

function makeDraft(overrides: Partial<WizardDraft> = {}): WizardDraft {
  return {
    connectionId: 'conn-1',
    name: 'Test Automation',
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

describe('AutomationsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with empty automations when localStorage is empty', () => {
    const { result } = renderHook(() => useAutomations(), { wrapper });
    expect(result.current.automations).toEqual([]);
  });

  it('throws when useAutomations is used outside provider', () => {
    expect(() => {
      renderHook(() => useAutomations());
    }).toThrow('useAutomations must be used within an AutomationsProvider');
  });

  describe('addAutomation', () => {
    it('creates an automation from a draft with generated ID and timestamps', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });
      const draft = makeDraft();

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(draft);
      });

      expect(automation!.id).toBeTruthy();
      expect(automation!.connectionId).toBe('conn-1');
      expect(automation!.name).toBe('Test Automation');
      expect(automation!.direction).toBe('export');
      expect(automation!.dataType).toBe('contact');
      expect(automation!.status).toBe('active');
      expect(automation!.createdAt).toBeTruthy();
      expect(automation!.updatedAt).toBeTruthy();
      expect(automation!.selectedFields).toEqual(draft.selectedFields);
      expect(automation!.formatOptions).toEqual(draft.formatOptions);
      expect(automation!.schedule).toBe('daily');
      expect(result.current.automations).toHaveLength(1);
    });

    it('includes transactionalSource when present in draft', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });
      const draft = makeDraft({ dataType: 'transactional', transactionalSource: 'treatments' });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(draft);
      });

      expect(automation!.transactionalSource).toBe('treatments');
    });

    it('omits transactionalSource when null in draft', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(makeDraft());
      });

      expect(automation!.transactionalSource).toBeUndefined();
    });

    it('persists fileType, fileNamingPattern, and filters from draft', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });
      const draft = makeDraft({
        fileType: 'json',
        fileNamingPattern: '{connector_name}_{timestamp}',
        filters: { combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] },
      });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(draft);
      });

      expect(automation!.fileType).toBe('json');
      expect(automation!.fileNamingPattern).toBe('{connector_name}_{timestamp}');
      expect(automation!.filters).toEqual({ combinator: 'AND', rules: [{ field: '', operator: '', value: '' }], groups: [] });
    });

    it('persists enrichmentKeyField when present in draft', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });
      const draft = makeDraft({
        dataType: 'transactional_with_contact',
        transactionalSource: 'treatments',
        enrichmentKeyField: 'customerId',
      });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(draft);
      });

      expect(automation!.enrichmentKeyField).toBe('customerId');
    });

    it('omits enrichmentKeyField when null in draft', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(makeDraft());
      });

      expect(automation!.enrichmentKeyField).toBeUndefined();
    });
  });

  describe('updateAutomation', () => {
    it('updates automation fields while preserving id and createdAt', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(makeDraft());
      });

      const updatedDraft = makeDraft({ name: 'Updated Name', schedule: 'hourly' });
      act(() => {
        result.current.updateAutomation(automation!.id, updatedDraft);
      });

      const updated = result.current.automations[0];
      expect(updated.id).toBe(automation!.id);
      expect(updated.createdAt).toBe(automation!.createdAt);
      expect(updated.name).toBe('Updated Name');
      expect(updated.schedule).toBe('hourly');
      expect(updated.updatedAt).toBeTruthy();
      expect(new Date(updated.updatedAt).toISOString()).toBe(updated.updatedAt);
    });

    it('updates new fields (fileType, fileNamingPattern, enrichmentKeyField, filters)', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(makeDraft());
      });

      const updatedDraft = makeDraft({
        fileType: 'xml',
        fileNamingPattern: '{connector_name}_{date}_{timestamp}',
        enrichmentKeyField: 'customerId',
        filters: { combinator: 'OR', rules: [{ field: 'status', operator: 'equals', value: 'active' }], groups: [] },
      });
      act(() => {
        result.current.updateAutomation(automation!.id, updatedDraft);
      });

      const updated = result.current.automations[0];
      expect(updated.fileType).toBe('xml');
      expect(updated.fileNamingPattern).toBe('{connector_name}_{date}_{timestamp}');
      expect(updated.enrichmentKeyField).toBe('customerId');
      expect(updated.filters).toEqual({ combinator: 'OR', rules: [{ field: 'status', operator: 'equals', value: 'active' }], groups: [] });
    });
  });

  describe('toggleAutomationStatus', () => {
    it('toggles active to paused', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(makeDraft());
      });

      act(() => {
        result.current.toggleAutomationStatus(automation!.id);
      });

      expect(result.current.automations[0].status).toBe('paused');
    });

    it('toggles paused back to active', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(makeDraft());
      });

      act(() => {
        result.current.toggleAutomationStatus(automation!.id);
      });
      act(() => {
        result.current.toggleAutomationStatus(automation!.id);
      });

      expect(result.current.automations[0].status).toBe('active');
    });
  });

  describe('deleteAutomation', () => {
    it('removes the automation from state', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });

      let automation: ReturnType<typeof result.current.addAutomation>;
      act(() => {
        automation = result.current.addAutomation(makeDraft());
      });

      expect(result.current.automations).toHaveLength(1);

      act(() => {
        result.current.deleteAutomation(automation!.id);
      });

      expect(result.current.automations).toHaveLength(0);
    });
  });

  describe('localStorage persistence', () => {
    it('persists automations to localStorage on add', () => {
      const { result } = renderHook(() => useAutomations(), { wrapper });

      act(() => {
        result.current.addAutomation(makeDraft());
      });

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Test Automation');
    });

    it('restores automations from localStorage on init', () => {
      const existing = [{
        id: 'existing-id',
        connectionId: 'conn-1',
        name: 'Persisted Automation',
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

      const { result } = renderHook(() => useAutomations(), { wrapper });
      expect(result.current.automations).toHaveLength(1);
      expect(result.current.automations[0].name).toBe('Persisted Automation');
    });

    it('falls back to empty array on corrupted localStorage data', () => {
      localStorage.setItem(STORAGE_KEY, 'not-valid-json{{{');

      const { result } = renderHook(() => useAutomations(), { wrapper });
      expect(result.current.automations).toEqual([]);
    });

    it('falls back to empty array when localStorage contains non-array', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ not: 'an array' }));

      const { result } = renderHook(() => useAutomations(), { wrapper });
      expect(result.current.automations).toEqual([]);
    });
  });
});
