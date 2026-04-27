import { supabase, isSupabaseConfigured } from '../supabase';
import type { ContactRecord, TreatmentRecord, ProductRecord } from '../../models/data';
import { contacts as localContacts } from '../../data/contacts';
import { treatments as localTreatments } from '../../data/treatments';
import { products as localProducts } from '../../data/products';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToContact(row: any): ContactRecord {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    membershipTier: row.membership_tier,
    joinDate: row.join_date,
    communicationPreferences: row.communication_preferences,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToTreatment(row: any): TreatmentRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    treatmentType: row.treatment_type,
    therapistName: row.therapist_name,
    treatmentDate: row.treatment_date,
    durationMinutes: row.duration_minutes,
    price: row.price,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToProduct(row: any): ProductRecord {
  return {
    id: row.id,
    customerId: row.customer_id,
    productName: row.product_name,
    category: row.category,
    purchaseChannel: row.purchase_channel,
    purchaseDate: row.purchase_date,
    price: row.price,
  };
}

export async function getContacts(): Promise<ContactRecord[]> {
  if (!isSupabaseConfigured()) return localContacts;

  const { data, error } = await supabase!.from('contacts').select('id, first_name, last_name, email, phone, membership_tier, join_date, communication_preferences');
  if (error || !data) return localContacts;

  return data.map(mapRowToContact);
}

export async function getTreatments(): Promise<TreatmentRecord[]> {
  if (!isSupabaseConfigured()) return localTreatments;

  const { data, error } = await supabase!.from('treatments').select('*');
  if (error || !data) return localTreatments;

  return data.map(mapRowToTreatment);
}

export async function getProducts(): Promise<ProductRecord[]> {
  if (!isSupabaseConfigured()) return localProducts;

  const { data, error } = await supabase!.from('products').select('*');
  if (error || !data) return localProducts;

  return data.map(mapRowToProduct);
}
