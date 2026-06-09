import { z } from "zod"
import { router, publicProcedure } from "@/lib/trpc/server"
import { getAllWords, getWordBySlug } from "@/server/db/word.queries"

export const wordRouter = router({
  list: publicProcedure.query(() => getAllWords()),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getWordBySlug(input.slug)),
})
