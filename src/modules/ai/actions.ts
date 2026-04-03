"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getChatMessages } from "@/lib/firestore/repos";

export async function getChatHistory() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return getChatMessages(session.user.id, 50);
}
