import { prisma } from "@/lib/prisma"

export function getAllWords() {
  return prisma.word.findMany({ orderBy: { createdAt: "desc" } })
}

export function getWordBySlug(slug: string) {
  return prisma.word.findUnique({ where: { slug } })
}
