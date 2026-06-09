import { z } from "zod"

export const wordSchema = z.object({
  word: z.string().min(1, { error: "Word is required" }),
  definition: z.string().min(1, { error: "Definition is required" }),
})

export type WordFormValues = z.infer<typeof wordSchema>
