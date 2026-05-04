import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-white text-gray-900">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Test Upload Project</h1>
        <p className="text-gray-500 text-center max-w-md font-medium">
          Sistema de carga de archivos avanzado con progreso asíncrono, validación y diseño profesional.
        </p>
        <Link 
          href="/upload" 
          className="rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-xl shadow-blue-100"
        >
          Ir a /upload
        </Link>
      </div>
    </main>
  );
}
