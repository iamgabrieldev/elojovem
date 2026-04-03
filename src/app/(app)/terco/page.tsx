import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMysterySetForToday } from "@/lib/rosary/mysteries";
import { RosaryPlayer } from "@/components/features/rosary/rosary-player";
import { getUserProfile } from "@/lib/firestore/repos";

export default async function TercoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");
  if (!user.onboardingCompleted) redirect("/tradicao");
  if (user.tradition !== "CATHOLIC") redirect("/dashboard");

  const set = getMysterySetForToday();

  return <RosaryPlayer set={set} />;
}
