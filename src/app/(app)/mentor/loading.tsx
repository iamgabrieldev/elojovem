import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <div className="flex flex-col gap-3 pb-24">
        <Skeleton className="h-16 w-4/5" />
        <Skeleton className="h-16 w-3/5 self-end" />
        <Skeleton className="h-16 w-4/6" />
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  );
}

