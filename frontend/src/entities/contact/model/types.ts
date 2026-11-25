export interface Contact {
  id: number;
  city: string;
  street: string;
  house: string;
  structure: string;
  building: string;
  apartment: string;
  phone: string;
}

export type ContactPayload = Omit<Contact, 'id'> & { id?: number };

export function formatContact(contact: Contact): string {
  const parts = [
    contact.city,
    contact.street,
    contact.house,
    contact.structure,
    contact.building,
    contact.apartment,
  ].filter(Boolean);
  return `${parts.join(', ')} · ${contact.phone}`;
}
