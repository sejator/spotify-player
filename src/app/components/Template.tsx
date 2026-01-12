"use client";

import { ReactNode, Suspense } from "react";

export default function Template({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
