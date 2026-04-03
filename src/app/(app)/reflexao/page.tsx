import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReflectionForm } from "./reflection-form";
import { getUserProfile } from "@/lib/firestore/repos";

export default async function ReflexaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getUserProfile(session.user.id);
  if (!user) redirect("/login");
  if (!user.onboardingCompleted) redirect("/tradicao");

  return <ReflectionForm />;
}
