import { BottomNav } from "@/components/ui/bottom-nav";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { assertRegistrationPaymentDone } from "@/lib/payment-gate";
import { PageTransition } from "@/components/ui/page-transition";
import { getUserProfile } from "@/lib/firestore/repos";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserProfile(session.user.id);
  if (!user) {
    redirect("/login");
  }
  await assertRegistrationPaymentDone(user);

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--bg))] pb-20">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <PageTransition>{children}</PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}
