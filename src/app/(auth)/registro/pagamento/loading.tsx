import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-2 w-full" />
      <div className="text-center">
        <Skeleton className="mx-auto h-7 w-36" />
        <Skeleton className="mx-auto mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

