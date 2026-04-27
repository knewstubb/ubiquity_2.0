export interface ContactRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  membershipTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joinDate: string;           // ISO date
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface TreatmentRecord {
  id: string;
  customerId: string;         // References ContactRecord.id
  treatmentType: string;      // e.g., 'Deep Tissue Massage', 'Hydrating Facial'
  therapistName: string;
  treatmentDate: string;      // ISO date
  durationMinutes: number;
  price: number;
}

export interface ProductRecord {
  id: string;
  customerId: string;         // References ContactRecord.id
  productName: string;        // e.g., 'Vitamin C Serum', 'Gift Card $100'
  category: 'Skincare' | 'Wellness' | 'Gift Card' | 'Treatment Voucher';
  purchaseChannel: 'In-Person' | 'Online';
  purchaseDate: string;       // ISO date
  price: number;
}
