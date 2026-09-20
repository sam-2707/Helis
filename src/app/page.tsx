import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
        Helis
      </p>
      <h1 className="mt-3 max-w-3xl text-5xl leading-tight text-[var(--ink)]">
        One-tap classroom rituals. Parent WhatsApp without the typing.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-[var(--ink-soft)]">
        Built for Indian schools where teachers have a phone, not a desk PC.
        Homework check, volunteer, late — tap once, Helis logs it and can notify
        parents.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/teacher/mobile"
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white"
        >
          Open teacher phone app
        </Link>
        <Link
          href="/teacher"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm"
        >
          Desktop teacher
        </Link>
        <Link
          href="/parent"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm"
        >
          Parent demo
        </Link>
      </div>

      <section className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Phone rituals",
            body: "Template chips + homework roll-call — no typing mid-period.",
          },
          {
            title: "Volunteer → WhatsApp",
            body: "One tap logs a win and messages the parent (consent gated).",
          },
          {
            title: "Class events",
            body: "Name + duration → every student record populated; mark volunteers.",
          },
          {
            title: "Installable PWA",
            body: "Add Helis to the phone home screen — works like an app.",
          },
          {
            title: "Digests & Pulse",
            body: "Desktop view still has bilingual digests, Pulse, Kanban, chat.",
          },
          {
            title: "ERP add-on",
            body: "Layer on top of existing school systems — not a full SIS.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <h2 className="text-xl text-[var(--ink)]">{item.title}</h2>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
