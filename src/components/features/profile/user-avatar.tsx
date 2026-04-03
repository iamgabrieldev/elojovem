import { cn } from "@/lib/utils";

function avatarUrl(seed: string) {
  const s = encodeURIComponent(seed.slice(0, 64));
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${s}&backgroundColor=f5f1eb`;
}

interface UserAvatarProps {
  seed: string;
  /** pixels (width & height). Default 96 */
  size?: number;
  className?: string;
}

/** Avatar determinístico (DiceBear) — não depende de foto do usuário. */
export function UserAvatar({ seed, size = 96, className }: UserAvatarProps) {
  const src = avatarUrl(seed || "elo-jovem");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn(
        "shrink-0 rounded-full border-4 border-amber-100 bg-amber-50 object-cover shadow-sm ring-2 ring-amber-200/60",
        className
      )}
    />
  );
}
