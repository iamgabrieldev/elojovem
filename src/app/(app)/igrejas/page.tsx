import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChurchFinder } from "@/components/features/churches/church-finder";
import { getUserProfile } from "@/lib/firestore/repos";

export default async function IgrejasPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");
  if (!user.onboardingCompleted) redirect("/tradicao");

  const traditionLabel = user.tradition === "CATHOLIC" ? "Paróquias" : "Igrejas";

  return <ChurchFinder traditionLabel={traditionLabel} />;
}
