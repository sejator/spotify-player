import { clsx } from "clsx";

export default function CenterBox({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx("min-h-screen flex flex-col justify-start items-center text-center px-4 flex-1 pt-20", className)}>{children}</div>;
}
