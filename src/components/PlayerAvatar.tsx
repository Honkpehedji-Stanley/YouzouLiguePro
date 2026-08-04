import Image from "next/image";

export function PlayerAvatar({
  photoUrl,
  name,
  size = 40,
  variant = "list",
  className = "",
}: {
  photoUrl: string | null;
  name: string;
  size?: number;
  variant?: "list" | "hero";
  className?: string;
}) {
  const style = { width: size, height: size * (4 / 3) };

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={Math.round(size * (4 / 3))}
        className={`shrink-0 rounded-sm bg-black/10 object-cover object-top ${className}`}
      />
    );
  }

  if (variant === "hero") {
    return (
      <Image
        src="/player-placeholder.avif"
        alt={name}
        width={size}
        height={Math.round((size * 760) / 1040)}
        className={`shrink-0 rounded-sm bg-black/5 object-contain ${className}`}
      />
    );
  }

  return (
    <div
      style={style}
      className={`flex shrink-0 items-end justify-center overflow-hidden rounded-sm bg-black/10 ${className}`}
      aria-label={name}
    >
      <svg viewBox="0 0 100 120" className="h-[115%] w-[85%] text-black/25" fill="currentColor">
        <circle cx="50" cy="38" r="26" />
        <path d="M50 68c-30 0-46 18-46 40v12h92v-12c0-22-16-40-46-40z" />
      </svg>
    </div>
  );
}
