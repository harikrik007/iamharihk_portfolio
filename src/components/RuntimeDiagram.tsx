// How AgentBaba runs, with the two parts Hari built highlighted.
const NODES = [
  { title: "AI workers", note: "work in the background" },
  { title: "Agentic runtime", note: "built by me", mine: true },
  { title: "AI-operable database", note: "built by me", mine: true },
];

export function RuntimeDiagram() {
  return (
    <figure className="rounded-xl border border-white/10 bg-ink/40 p-4 backdrop-blur-md">
      <figcaption className="label">How AgentBaba runs</figcaption>
      <ol className="mt-4 flex flex-col items-stretch gap-0 sm:flex-row sm:items-center" aria-label="AI workers, then the agentic runtime, then the AI-operable database">
        {NODES.map((node, i) => (
          <li key={node.title} className="contents">
            {i > 0 && <span aria-hidden className="flow mx-auto h-5 w-px sm:mx-0 sm:h-px sm:w-auto sm:min-w-6 sm:flex-1" />}
            <div
              className={`rounded-lg border px-3 py-2.5 sm:w-36 ${
                node.mine ? "border-ember/45 bg-ember/[0.06]" : "border-white/12 bg-white/[0.03]"
              }`}
            >
              <p className="text-sm font-medium">{node.title}</p>
              <p className={`mt-0.5 font-mono text-xs ${node.mine ? "text-ember" : "text-muted"}`}>{node.note}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 font-mono text-xs text-muted">↳ connected to email, calls, calendar &amp; files</p>
    </figure>
  );
}
