export type DocumentStatus =
  | "not-started"
  | "requested"
  | "received"
  | "apostille-pending"
  | "apostilled"
  | "translation-pending"
  | "ready"
  | "not-applicable";

export type ChecklistItem = {
  id: string;
  workflow: string;
  title: string;
  person: "Irving" | "Employer" | "Partner" | "Both" | string;
  required: string | boolean;
  city?: string;
  apostille: string;
  translation: string;
  validity?: string;
  recommendedLeadTime?: string;
  status: DocumentStatus;
  officialUrl?: string;
  notes: string;
  caution?: string;
  dueOffsetDays?: string | number;
  sortOrder?: string | number;
};

export type TrackerPayload = {
  checklist: ChecklistItem[];
  timeline: Record<string, string>[];
  sources: Record<string, string>[];
  warnings: Record<string, string>[];
  settings: Record<string, string>[];
  uploads: Record<string, string>[];
};
