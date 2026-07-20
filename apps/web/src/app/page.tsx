const platformCapabilities = ["Rhythm practice", "Bol feedback", "Mudra learning"];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold tracking-[0.2em] text-amber-800">RIYAAZ</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        Practice Kathak with intention.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
        RIYAAZ is building a considered practice space for students and teachers.
      </p>
      <ul className="mt-8 flex flex-wrap gap-3" aria-label="Planned capabilities">
        {platformCapabilities.map((capability) => (
          <li className="rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-950" key={capability}>
            {capability}
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm text-stone-600">Platform foundation is operational.</p>
    </main>
  );
}
