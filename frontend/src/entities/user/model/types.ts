export type UserType = 'buyer' | 'shop';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  position: string;
  type: UserType;
  contacts?: unknown[];
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  company?: string;
  position?: string;
  password?: string;
}
