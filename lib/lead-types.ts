export const LEAD_STATUSES = ["baru", "dihubungi", "tertarik", "deal", "tolak"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type Lead = {
  id: string;
  place_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  website: string | null;
  maps_url: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
