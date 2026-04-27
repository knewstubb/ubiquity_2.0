import { describe, it, expect, vi, beforeEach } from 'vitest';

const { s, from, qb, auth } = vi.hoisted(() => {
  const s = { data: null as unknown, error: null as unknown, configured: true };
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  const qb: Record<string, ReturnType<typeof vi.fn>> = {};
  qb.eq = vi.fn().mockImplementation(() => t(qb));
  qb.single = vi.fn().mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select = vi.fn().mockImplementation(() => t(qb));
  qb.insert = vi.fn().mockImplementation(() => t(qb));
  qb.update = vi.fn().mockImplementation(() => t(qb));
  qb.delete = vi.fn().mockImplementation(() => t(qb));
  const from = vi.fn().mockImplementation(() => t(qb));
  const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }) };
  return { s, from, qb, auth };
});

vi.mock('../../supabase', () => ({
  supabase: { from, auth },
  isSupabaseConfigured: () => s.configured,
}));

import * as dataAdapter from '../data-adapter';
import { contacts as localContacts } from '../../../data/contacts';
import { treatments as localTreatments } from '../../../data/treatments';
import { products as localProducts } from '../../../data/products';

function set(data: unknown, error: unknown = null) { s.data = data; s.error = error; }
function reset() {
  s.data = null; s.error = null; s.configured = true;
  vi.clearAllMocks();
  const t = (o: Record<string, unknown>) => Object.assign(o, { then: (r: (v: unknown) => void, j?: (e: unknown) => void) => Promise.resolve({ data: s.data, error: s.error }).then(r, j) });
  qb.eq.mockImplementation(() => t(qb)); qb.single.mockImplementation(() => Promise.resolve({ data: s.data, error: s.error }));
  qb.select.mockImplementation(() => t(qb)); qb.insert.mockImplementation(() => t(qb));
  qb.update.mockImplementation(() => t(qb)); qb.delete.mockImplementation(() => t(qb));
  from.mockImplementation(() => t(qb)); auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } });
}

describe('data-adapter', () => {
  beforeEach(() => reset());

  describe('Supabase mode', () => {
    it('getContacts maps snake_case rows to camelCase', async () => {
      set([{ id: 'c1', first_name: 'Jane', last_name: 'Doe', email: 'jane@test.com', phone: '123', membership_tier: 'Gold', join_date: '2024-01-01', communication_preferences: { email: true } }]);
      const result = await dataAdapter.getContacts();
      expect(from).toHaveBeenCalledWith('contacts');
      expect(result[0].firstName).toBe('Jane');
      expect(result[0].membershipTier).toBe('Gold');
    });

    it('getContacts falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await dataAdapter.getContacts()).toBe(localContacts);
    });

    it('getTreatments maps snake_case rows to camelCase', async () => {
      set([{ id: 't1', customer_id: 'c1', treatment_type: 'Massage', therapist_name: 'Dr. Smith', treatment_date: '2024-01-01', duration_minutes: 60, price: 100 }]);
      const result = await dataAdapter.getTreatments();
      expect(from).toHaveBeenCalledWith('treatments');
      expect(result[0].customerId).toBe('c1');
      expect(result[0].durationMinutes).toBe(60);
    });

    it('getTreatments falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await dataAdapter.getTreatments()).toBe(localTreatments);
    });

    it('getProducts maps snake_case rows to camelCase', async () => {
      set([{ id: 'p1', customer_id: 'c1', product_name: 'Serum', category: 'Skincare', purchase_channel: 'Online', purchase_date: '2024-01-01', price: 50 }]);
      const result = await dataAdapter.getProducts();
      expect(from).toHaveBeenCalledWith('products');
      expect(result[0].productName).toBe('Serum');
      expect(result[0].purchaseChannel).toBe('Online');
    });

    it('getProducts falls back to local data on error', async () => {
      set(null, { message: 'error' });
      expect(await dataAdapter.getProducts()).toBe(localProducts);
    });
  });

  describe('Local fallback mode', () => {
    beforeEach(() => { s.configured = false; });

    it('getContacts returns local contacts', async () => {
      expect(await dataAdapter.getContacts()).toBe(localContacts);
      expect(from).not.toHaveBeenCalled();
    });

    it('getTreatments returns local treatments', async () => {
      expect(await dataAdapter.getTreatments()).toBe(localTreatments);
      expect(from).not.toHaveBeenCalled();
    });

    it('getProducts returns local products', async () => {
      expect(await dataAdapter.getProducts()).toBe(localProducts);
      expect(from).not.toHaveBeenCalled();
    });
  });
});
