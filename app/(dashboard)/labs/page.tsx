import Link from 'next/link'
import { FlaskConical, Star, MapPin, Clock, Package, Plus } from 'lucide-react'

const LABS = [
  { id: '1', name: 'ProDent Lab Madrid',    city: 'Madrid',    specialties: ['Prótesis Fija', 'Zirconio', 'CAD/CAM'], orders: 14, rating: 4.9, turnaround: '5-7 días', certified: true },
  { id: '2', name: 'OrthoLab BCN',          city: 'Barcelona', specialties: ['Ortodoncia', 'Retenedores', 'Férulas'], orders: 8,  rating: 4.8, turnaround: '3-5 días', certified: true },
  { id: '3', name: 'TechDental Madrid',     city: 'Madrid',    specialties: ['Implantología', 'Cirugía Guiada'],      orders: 5,  rating: 4.7, turnaround: '7-10 días', certified: true },
  { id: '4', name: 'ImplantLab Norte',      city: 'Bilbao',    specialties: ['Implantes', 'Prótesis sobre implante'], orders: 3,  rating: 4.6, turnaround: '7-12 días', certified: false },
  { id: '5', name: 'CeraDent Valencia',     city: 'Valencia',  specialties: ['Cerámica', 'Estética Dental'],          orders: 6,  rating: 4.5, turnaround: '5-8 días', certified: true },
  { id: '6', name: 'Digital Smile Lab',     city: 'Sevilla',   specialties: ['Diseño Digital', 'DSD', 'Estética'],    orders: 11, rating: 5.0, turnaround: '4-6 días', certified: true },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />)}
      <span className="text-xs text-slate-400 ml-1">{rating}</span>
    </div>
  )
}

export default function LabsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Laboratorios</h1>
        <p className="text-slate-400 text-sm mt-0.5">{LABS.length} laboratorios activos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {LABS.map((lab) => (
          <div key={lab.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-sky-500/40 transition flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{lab.name}</h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" /> {lab.city}
                  </div>
                </div>
              </div>
              {lab.certified && (
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-full">ISO</span>
              )}
            </div>

            <Stars rating={lab.rating} />

            <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Entrega: {lab.turnaround}
            </div>

            <div className="flex flex-wrap gap-1 mt-3">
              {lab.specialties.map((s) => (
                <span key={s} className="bg-slate-700/60 text-slate-400 text-[11px] px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3">
              <Package className="w-3.5 h-3.5" /> {lab.orders} órdenes activas
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
              <Link href={`/labs/${lab.id}`} className="flex-1 text-center text-xs font-medium text-slate-300 hover:text-sky-400 border border-slate-600 hover:border-sky-500/40 rounded-lg py-2 transition">
                Ver perfil
              </Link>
              <Link href="/orders/new" className="flex-1 flex items-center justify-center gap-1 text-xs font-medium bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/20 rounded-lg py-2 transition">
                <Plus className="w-3 h-3" /> Nueva orden
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
