import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export default function LinkButton({ href, children, variant = "primary" }: Props) {
  const baseClass =
    "flex items-center justify-center h-12 w-full rounded-lg font-medium transition-opacity hover:opacity-80";

  const variantClass =
    variant === "primary"
      ? "bg-black text-white"
      : "border border-black text-black";

  return (
    <Link href={href} className={`${baseClass} ${variantClass}`}>
      {children}
    </Link>
  );
}
