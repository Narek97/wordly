import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

export async function createContext(_opts: FetchCreateContextFnOptions) {
  const session = await auth()
  return { session, prisma }
}

export type Context = Awaited<ReturnType<typeof createContext>>
