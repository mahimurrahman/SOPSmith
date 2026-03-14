import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid work email address."),
});

export const createSopSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Use a clearer SOP title with at least 5 characters.")
    .max(120, "Keep the title under 120 characters so it stays easy to scan later."),
  rawNotes: z
    .string()
    .trim()
    .max(6000, "Keep the rough notes under 6,000 characters so they stay focused."),
});

export const uuidSchema = z.string().uuid();
