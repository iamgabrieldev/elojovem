import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-2 w-full" />
      <div className="text-center">
        <Skeleton className="mx-auto h-6 w-28" />
        <Skeleton className="mx-auto mt-2 h-4 w-64" />
      </div>
      <Skeleton className="mx-auto h-40 w-40 rounded-full" />
    </div>
  );
}

