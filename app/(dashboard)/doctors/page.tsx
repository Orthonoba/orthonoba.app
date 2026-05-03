import Link from 'next/link'
import { Stethoscope, Star, Briefcase, Building2 } from 'lucide-react'

const DOCTORS = [
  { id: '1', name: 'Dr. Carlos García López',    specialty: 'Ortodoncia',       clinic: 'Clínica Dental Norte', cases: 12, rating: 4.9, avatar: 'GL' },
  { id: '2', name: 'Dra. Ana Rodríguez Alba',    specialty: 'Prótesis Dental',  clinic: 'OrthoSmile Barcelona', cases: 8,  rating: 4.8, avatar: 'RA' },
  { id: '3', name: 'Dr. Javier Martínez Sanz',   specialty: 'Implantología',    clinic: 'Dental Vanguard',      cases: 5,  rating: 4.7, avatar: 'MS' },
  { id: '4', name: 'Dra. Laura Fernández Cruz',  specialty: 'Ortodoncia',       clinic: 'Sonrisa Perfecta',     cases: 21, rating: 5.0, avatar: 'FC' },
  { id: '5', name: 'Dr. Miguel Torres Gil',      specialty: 'Cirugía Oral',     clinic: 'OralTech Bilbao',      cases: 3,  rating: 4.6, avatar: 'TG' },
  { id: '6', name: 'Dra. Patricia Ruiz Vega',    specialty: 'Endodoncia',       clinic: 'Dental Excellence',    cases: 7,  rating: 4.8, avatar: 'RV' },
  { id: '7', name: 'Dr. Roberto Díaz Blanco',   specialty: 'Periodoncia',      clinic: 'Clínica Dental Norte', cases: 9,  rating: 4.5, avatar: 'DB' },
  { id: '8', name: 'Dra. Carmen Alonso Pérez',  specialty: 'Odontología Gral.',clinic: 'OrthoSmile Barcelona', cases: 15, rating: 4.7, avatar: 'AP' },
]

const SPECIALTIES = [...new Set(DOCTORS.map((d) => d.specialty))]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
      ))}
      <span className="text-xs text-slate-400 ml-1">{rating}</span>
    </div>
  )
}

export default function DoctorsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Doctores</h1>
          <p className="text-slate-400 text-sm mt-0.5">{DOCTORS.length} profesionales registrados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input placeholder="Buscar doctor..." className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 w-52 transition" />
        <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="">Todas las especialidades</option>
          {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-sky-500">
          <option value="">Todas las clínicas</option>
          {[...new Set(DOCTORS.map((d) => d.clinic))].map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {DOCTORS.map((doc) => (
          <Link key={doc.id} href={`/doctors/${doc.id}`} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-sky-500/40 transition group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {doc.avatar}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm leading-tight group-hover:text-sky-400 transition truncate">{doc.name}</p>
                <p className="text-xs text-sky-400/80 mt-0.5">{doc.specialty}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{doc.clinic}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                {doc.cases} casos activos
              </div>
              <Stars rating={doc.rating} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
