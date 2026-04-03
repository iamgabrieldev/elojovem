import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakCalendarProps {
  activeDays: string[];
}

export function StreakCalendar({ activeDays }: StreakCalendarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthName = new Date(year, month).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const days: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const activeSet = new Set(activeDays);
  const today = now.getDate();

  return (
    <Card>
      <p className="mb-3 text-sm font-semibold text-slate-900 capitalize">
        {monthName}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i} className="text-[10px] font-medium text-slate-400 pb-1">
            {d}
          </span>
        ))}
        {days.map((day, i) => {
          if (day === null) return <span key={i} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const active = activeSet.has(dateStr);
          const isToday = day === today;

          return (
            <div
              key={i}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium mx-auto",
                active && "bg-amber-500 text-white",
                !active && isToday && "border-2 border-amber-300 text-amber-600",
                !active && !isToday && "text-slate-400"
              )}
            >
              {day}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
