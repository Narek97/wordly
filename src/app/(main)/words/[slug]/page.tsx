export default async function WordPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <main>{slug}</main>
}
