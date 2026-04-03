import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-2 w-full" />
      <div className="text-center">
        <Skeleton className="mx-auto h-7 w-52" />
        <Skeleton className="mx-auto mt-2 h-4 w-72" />
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

