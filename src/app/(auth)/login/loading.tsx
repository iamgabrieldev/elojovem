import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <Skeleton className="mx-auto h-7 w-32" />
        <Skeleton className="mx-auto mt-2 h-4 w-56" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="h-12 w-full rounded-full" />
    </div>
  );
}

