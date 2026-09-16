import Link from "next/link";

import { ParentDashboard } from "@/components/parent-dashboard";

export default function ParentPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
        ← Helis home
      </Link>
      <div className="mt-6">
        <ParentDashboard guardianId="guard-1" />
      </div>
      <p className="mt-10 text-xs text-[var(--muted)]">
        Demo is signed in as Rajesh Mehta (Arjun&apos;s parent). Switch child via
        the chips above.
      </p>
    </main>
  );
}
