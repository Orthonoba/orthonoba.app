import Link from 'next/link'

export default function Hero() {
  return (
    <section className="py-24 px-5 text-center bg-white">
      <div className="max-w-3xl mx-auto">

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
          El sistema operativo dental para clínicas y laboratorios
        </h1>

        <p className="text-lg text-slate-500 leading-relaxed mb-10">
          Gestiona pacientes, diseña en CAD, automatiza marketing y controla tu laboratorio
          desde una sola plataforma.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/demo"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Solicitar demo
          </Link>
          <Link
            href="/login"
            className="border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Ver plataforma
          </Link>
        </div>

      </div>
    </section>
  )
}
