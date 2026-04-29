import type { StructuredSop } from "./structured";

export type CreateSopInput = {
  title: string;
  rawNotes: string;
};

export type CreateSopActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<keyof CreateSopInput, string>>;
  sopId?: string;
  values?: CreateSopInput;
};

export type SopSummary = {
  id: string;
  title: string;
  created_at: string;
  preview: string;
};

export type SopDetail = {
  id: string;
  title: string;
  content: string;
  raw_notes: string;
  structured_data: StructuredSop;
  created_at: string;
  updated_at: string;
};

export type CreatedSop = {
  id: string;
};

export type SopVersionSummary = {
  id: string;
  sop_id: string;
  content: string;
  structured_data: StructuredSop;
  created_at: string;
};
