import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { assertRegistrationPaymentDone } from "@/lib/payment-gate";
import { getUserProfile } from "@/lib/firestore/repos";

export default async function OnboardingLayout({
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-white px-6 py-10">
      <div className="mx-auto w-full max-w-md flex flex-col gap-8 flex-1">
        {children}
      </div>
    </div>
  );
}
