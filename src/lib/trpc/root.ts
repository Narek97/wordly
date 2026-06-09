import { router } from "./server"
import { wordRouter } from "@/server/routers/word.router"
import { adminRouter } from "@/server/routers/admin.router"

export const appRouter = router({
  word: wordRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
