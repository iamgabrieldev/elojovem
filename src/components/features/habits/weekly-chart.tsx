import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeeklyChartProps {
  weekData: { day: string; count: number }[];
}

export function WeeklyChart({ weekData }: WeeklyChartProps) {
  const max = Math.max(...weekData.map((d) => d.count), 1);

  return (
    <Card>
      <p className="mb-3 text-sm font-semibold text-slate-900">
        Consistência semanal
      </p>
      <div className="flex items-end justify-between gap-2 h-24">
        {weekData.map(({ day, count }) => (
          <div key={day} className="flex flex-1 flex-col items-center gap-1">
            <div className="w-full flex flex-col justify-end h-16">
              <div
                className={cn(
                  "w-full rounded-t-md transition-all",
                  count > 0 ? "bg-amber-400" : "bg-slate-100"
                )}
                style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? "8px" : "4px" }}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400">{day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
