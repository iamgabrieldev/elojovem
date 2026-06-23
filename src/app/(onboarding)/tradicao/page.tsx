import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { updateUser } from "@/lib/firestore/repos";

export default async function TradicaoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await updateUser(session.user.id, { tradition: "CATHOLIC" });
  redirect("/objetivos");
}
