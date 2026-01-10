interface ClockIconProps {
  className?: string;
  size?: number;
}

export function ClockIcon({
  className = "w-4 h-4",
  size = 18,
}: ClockIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M12 22A10 10 0 1 0 12 2a10 10 0 0 0 0 20z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 6v6l4 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
