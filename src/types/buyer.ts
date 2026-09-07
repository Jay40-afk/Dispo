export interface Buyer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  markets: string | null;
  price_min: number | null;
  price_max: number | null;
  property_types: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type BuyerInput = Omit<
  Buyer,
  "id" | "user_id" | "created_at" | "updated_at"
>;
