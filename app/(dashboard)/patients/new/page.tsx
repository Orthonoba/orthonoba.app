'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Phone, Building2, AlertTriangle } from 'lucide-react'

const schema = z.object({
  firstName:  z.string().min(2, 'Requerido'),
  lastName:   z.string().min(2, 'Requerido'),
  dni:        z.string().min(7, 'DNI inválido'),
  birthDate:  z.string().min(1, 'Requerido'),
  gender:     z.enum(['male', 'female', 'other']),
  phone:      z.string().min(7, 'Teléfono inválido'),
  email:      z.string().email('Email inválido').or(z.literal('')),
  address:    z.string().optional(),
  allergies:  z.string().optional(),
  medications:z.string().optional(),
  clinic:     z.string().min(1, 'Requerido'),
  doctor:     z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CLINICS = ['Clínica Dental Norte', 'OrthoSmile Barcelona', 'Dental Vanguard', 'Sonrisa Perfecta', 'OralTech Bilbao', 'Dental Excellence']
const DOCTORS = ['Dr. García López', 'Dra. Rodríguez Alba', 'Dr. Martínez Sanz', 'Dra. Fernández Cruz']

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-slate-300 mb-1 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

const INPUT = "w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition"

export default function NewPatientPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { gender: 'female', clinic: '' } })

  function onSubmit(_data: FormData) {
    toast.success('Paciente creado correctamente')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Nuevo Paciente</h1>
        <p className="text-slate-400 text-sm mt-0.5">Registra los datos del nuevo paciente</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Personal */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4">
              <User className="w-4 h-4 text-sky-400" /> Datos personales
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nombre" error={errors.firstName?.message}>
                <input {...register('firstName')} placeholder="María" className={INPUT} />
              </Field>
              <Field label="Apellidos" error={errors.lastName?.message}>
                <input {...register('lastName')} placeholder="González Ruiz" className={INPUT} />
              </Field>
            </div>
            <Field label="DNI / NIF" error={errors.dni?.message}>
              <input {...register('dni')} placeholder="12345678A" className={INPUT} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha de nacimiento" error={errors.birthDate?.message}>
                <input {...register('birthDate')} type="date" className={INPUT} />
              </Field>
              <Field label="Género" error={errors.gender?.message}>
                <select {...register('gender')} className={INPUT}>
                  <option value="female">Mujer</option>
                  <option value="male">Hombre</option>
                  <option value="other">Otro</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Right — Contact + Medical */}
          <div className="space-y-5">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-1">
                <Phone className="w-4 h-4 text-sky-400" /> Contacto
              </div>
              <Field label="Teléfono" error={errors.phone?.message}>
                <input {...register('phone')} placeholder="+34 600 000 000" className={INPUT} />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input {...register('email')} type="email" placeholder="maria@email.com" className={INPUT} />
              </Field>
              <Field label="Dirección" error={errors.address?.message}>
                <input {...register('address')} placeholder="Calle Mayor 1, Madrid" className={INPUT} />
              </Field>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Historial médico
              </div>
              <Field label="Alergias conocidas">
                <input {...register('allergies')} placeholder="Penicilina, látex..." className={INPUT} />
              </Field>
              <Field label="Medicación actual">
                <input {...register('medications')} placeholder="Ibuprofeno 400mg..." className={INPUT} />
              </Field>
            </div>
          </div>
        </div>

        {/* Footer — Clinic Assignment */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4">
            <Building2 className="w-4 h-4 text-sky-400" /> Asignación
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Clínica" error={errors.clinic?.message}>
              <select {...register('clinic')} className={INPUT}>
                <option value="">Seleccionar clínica</option>
                {CLINICS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Dentista responsable">
              <select {...register('doctor')} className={INPUT}>
                <option value="">Sin asignar</option>
                {DOCTORS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => window.history.back()} className="px-5 py-2.5 border border-slate-600 text-slate-300 hover:border-slate-500 rounded-lg text-sm font-medium transition">
            Cancelar
          </button>
          <button type="submit" className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg text-sm transition">
            Crear paciente
          </button>
        </div>
      </form>
    </div>
  )
}
