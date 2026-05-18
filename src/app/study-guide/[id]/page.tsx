import { redirect } from "next/navigation";

export default async function LegacyStudyGuide({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/room/${id}/study`);
}
