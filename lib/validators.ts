import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid work email address."),
});

export const createSopSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Add a title with at least 3 characters.")
    .max(120, "Keep the title under 120 characters so it stays easy to scan."),
  rawNotes: z
    .string()
    .trim()
    .min(20, "Add a few more rough notes so SOPSmith has enough detail to work from.")
    .max(6000, "Keep the rough notes under 6,000 characters."),
});

export const uuidSchema = z.string().uuid();
