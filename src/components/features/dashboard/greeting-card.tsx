import { getGreeting } from "@/lib/utils";

interface GreetingCardProps {
  name: string | null | undefined;
  streak: number;
}

export function GreetingCard({ name, streak }: GreetingCardProps) {
  const greeting = getGreeting();
  const firstName = name?.split(" ")[0] || "amigo(a)";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-sm text-slate-500">
          Como está sua jornada hoje?
        </p>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700">
          🔥 {streak}
        </div>
      )}
    </div>
  );
}
