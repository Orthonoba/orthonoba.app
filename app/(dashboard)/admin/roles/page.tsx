'use client'
import { useState } from 'react'
import { Save, Check } from 'lucide-react'
import { toast } from 'sonner'

const ROLES = ['Super Admin', 'Admin Clínica', 'Doctor', 'Técnico Lab', 'Viewer']
const MODULES = [
  'Pacientes', 'Casos', 'Órdenes de Lab', 'Archivos',
  'Facturación', 'Usuarios', 'Marketing', 'Academia',
  'Automatización', 'IA / Análisis', 'Configuración', 'API',
]
const ACTIONS = ['Ver', 'Crear', 'Editar', 'Eliminar']

type PermMatrix = Record<string, Record<string, Record<string, boolean>>>

function buildInitial(): PermMatrix {
  const m: PermMatrix = {}
  for (const role of ROLES) {
    m[role] = {}
    for (const mod of MODULES) {
      m[role][mod] = {}
      for (const act of ACTIONS) {
        // Super Admin has all, Viewer only Ver, others partial
        if (role === 'Super Admin') { m[role][mod][act] = true }
        else if (role === 'Viewer') { m[role][mod][act] = act === 'Ver' }
        else if (role === 'Admin Clínica') { m[role][mod][act] = act !== 'Eliminar' || ['Casos', 'Pacientes'].includes(mod) }
        else if (role === 'Doctor') { m[role][mod][act] = ['Ver', 'Crear'].includes(act) && ['Pacientes', 'Casos', 'Archivos', 'Academia'].includes(mod) }
        else { m[role][mod][act] = act === 'Ver' && !['API', 'Configuración', 'Usuarios'].includes(mod) }
      }
    }
  }
  return m
}

export default function AdminRolesPage() {
  const [perms, setPerms] = useState<PermMatrix>(buildInitial)
  const [saved, setSaved] = useState(false)

  function toggle(role: string, mod: string, act: string) {
    if (role === 'Super Admin') return
    setPerms((prev) => ({
      ...prev,
      [role]: { ...prev[role], [mod]: { ...prev[role]?.[mod], [act]: !prev[role]?.[mod]?.[act] } },
    }))
    setSaved(false)
  }

  function handleSave() {
    setSaved(true)
    toast.success('Permisos guardados correctamente')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Matriz de Permisos</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configura los permisos por rol y módulo</p>
        </div>
        <button onClick={handleSave} className={['flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm transition', saved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500 hover:bg-sky-400 text-white'].join(' ')}>
          {saved ? <><Check className="w-4 h-4" />Guardado</> : <><Save className="w-4 h-4" />Guardar cambios</>}
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-800 border-b border-slate-700 z-10">
              <tr>
                <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase w-36">Módulo</th>
                {ROLES.map((role) => (
                  <th key={role} colSpan={4} className="text-center px-2 py-3 border-l border-slate-700/50">
                    <span className={['font-semibold text-xs', role === 'Super Admin' ? 'text-violet-400' : role === 'Admin Clínica' ? 'text-sky-400' : 'text-slate-300'].join(' ')}>{role}</span>
                    <div className="flex justify-center gap-1 mt-1">
                      {ACTIONS.map((a) => <span key={a} className="w-9 text-center text-[10px] text-slate-500">{a}</span>)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {MODULES.map((mod) => (
                <tr key={mod} className="hover:bg-slate-700/20 transition">
                  <td className="px-4 py-2.5 font-medium text-slate-300">{mod}</td>
                  {ROLES.map((role) => (
                    <td key={role} colSpan={4} className="px-2 py-2.5 border-l border-slate-700/30">
                      <div className="flex justify-center gap-1">
                        {ACTIONS.map((act) => {
                          const checked = perms[role]?.[mod]?.[act] ?? false
                          const isSuperAdmin = role === 'Super Admin'
                          return (
                            <button
                              key={act}
                              onClick={() => toggle(role, mod, act)}
                              disabled={isSuperAdmin}
                              className={[
                                'w-9 h-6 rounded flex items-center justify-center transition',
                                checked
                                  ? isSuperAdmin ? 'bg-violet-500/30 text-violet-400' : 'bg-sky-500/30 text-sky-400'
                                  : 'bg-slate-700/40 text-slate-600 hover:text-slate-400',
                              ].join(' ')}
                            >
                              {checked ? <Check className="w-3 h-3" /> : <span className="w-3 h-3" />}
                            </button>
                          )
                        })}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Los permisos de <strong className="text-violet-400">Super Admin</strong> no se pueden modificar. Los cambios se aplican inmediatamente a todos los usuarios con el rol correspondiente.
      </p>
    </div>
  )
}
