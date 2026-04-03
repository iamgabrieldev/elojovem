"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME } from "@/lib/session-constants";

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
