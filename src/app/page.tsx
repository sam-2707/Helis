import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-16">
      <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
        Helis
      </p>
      <h1 className="mt-3 max-w-3xl text-5xl leading-tight text-[var(--ink)]">
        Classroom signals, bilingual digests, delivered where parents already
        are.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-[var(--ink-soft)]">
        Teachers log tiny updates in under ten seconds. Helis drafts English and
        Hindi summaries, surfaces early warnings, powers group project Kanbans,
        and pushes parent updates to WhatsApp.
      </p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/teacher"
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white"
        >
          Teacher demo
        </Link>
        <Link
          href="/parent"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm"
        >
          Parent demo
        </Link>
        <Link
          href="/teacher/projects/proj-1"
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm"
        >
          Group Kanbans
        </Link>
      </div>

      <section className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Log → Push",
            body: "Events become bilingual WhatsApp digests with consent gate.",
          },
          {
            title: "Pulse",
            body: "Deterministic early-warning ranks who needs attention before report cards.",
          },
          {
            title: "Group Kanbans",
            body: "One board per group; teacher sees all; card moves feed the event stream.",
          },
          {
            title: "Parent home",
            body: "Charts, timeline, and grounded chat for their child only.",
          },
          {
            title: "Reply drafts",
            body: "Teachers insert AI drafts grounded in recent classroom signals.",
          },
          {
            title: "ERP add-on",
            body: "Sits on top of existing school systems — not a rip-and-replace SIS.",
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
