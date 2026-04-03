import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-44 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

