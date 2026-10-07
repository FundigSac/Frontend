export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16 text-zinc-900">
      <h1 className="text-3xl font-semibold tracking-tight">FUNDIGSAC 2.0</h1>
      <p className="mt-3 text-lg text-zinc-600">Baseline de migración preparado</p>
      <nav aria-label="Artefactos de migración" className="mt-8 flex flex-col gap-3">
        <a className="underline underline-offset-4" href="http://localhost:4173/">
          Abrir mirror legacy (localhost:4173)
        </a>
        <p>Informes del crawl: consulta la carpeta <code>reports/</code>.</p>
        <p>Screenshots: consulta <code>legacy/screenshots/</code>.</p>
      </nav>
    </main>
  );
}
