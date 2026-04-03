"use client";

import { signOut } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={async () => {
        await fetch("/api/auth/session", { method: "DELETE" });
        try {
          await signOut(getFirebaseAuth());
        } catch {
          /* ignore */
        }
        window.location.href = "/login";
      }}
    >
      <LogOut className="h-4 w-4" />
      Sair da conta
    </Button>
  );
}
