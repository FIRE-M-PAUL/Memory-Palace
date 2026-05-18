import { redirect } from "next/navigation";

export default async function LegacyPresentation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/room/${id}/present`);
}
