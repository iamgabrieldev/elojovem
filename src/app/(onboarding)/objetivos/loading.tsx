import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-2 w-full" />
      <div className="text-center">
        <Skeleton className="mx-auto h-7 w-52" />
        <Skeleton className="mx-auto mt-2 h-4 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
}

