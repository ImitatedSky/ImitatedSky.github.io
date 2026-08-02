import type { ReactNode } from "react";
import Aside from "./Aside";

export default function ContentWithAside({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex gap-6 items-start">
        <div className="min-w-0 flex-1">{children}</div>
        <aside className="hidden lg:block w-72 shrink-0">
          <Aside />
        </aside>
      </div>
    </div>
  );
}
