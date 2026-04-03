import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-white px-6 text-center">
      <Skeleton className="h-16 w-16 rounded-2xl" />
      <Skeleton className="mt-6 h-7 w-40" />
      <Skeleton className="mt-3 h-4 w-64" />
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

