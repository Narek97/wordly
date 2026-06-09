import { z } from "zod"
import { router, adminProcedure } from "@/lib/trpc/server"

export const adminRouter = router({
  createWord: adminProcedure
    .input(z.object({ word: z.string().min(1), definition: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.word.create({
        data: { word: input.word, definition: input.definition, slug: input.word.toLowerCase() },
      }),
    ),
})
