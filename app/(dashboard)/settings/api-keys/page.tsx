'use client'
import { useState } from 'react'
import { Plus, Key, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

const INITIAL_KEYS = [
  { id: '1', name: 'Integración CRM',      prefix: 'sk_live_Abc1',  permissions: ['read:patients', 'read:cases'],             created: '2026-03-15', lastUsed: '2026-05-04' },
  { id: '2', name: 'App Móvil Interna',    prefix: 'sk_live_Xyz9',  permissions: ['read:all', 'write:orders', 'write:notes'],  created: '2026-01-10', lastUsed: '2026-05-03' },
]

const ALL_PERMISSIONS = ['read:all', 'write:all', 'read:patients', 'write:patients', 'read:cases', 'write:cases', 'read:orders', 'write:orders', 'read:billing', 'write:notes']

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(INITIAL_KEYS)
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedPerms, setSelectedPerms] = useState<string[]>(['read:all'])
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null)

  function handleCreate() {
    if (!newKeyName.trim()) { toast.error('Introduce un nombre para la key'); return }
    const key = 'sk_live_' + Math.random().toString(36).slice(2, 10)
    setKeys((prev) => [{
      id: String(Date.now()), name: newKeyName, prefix: key.slice(0, 12),
      permissions: selectedPerms, created: new Date().toISOString().slice(0, 10), lastUsed: '—',
    }, ...prev])
    setNewKey(key)
    setShowCreate(false)
    setNewKeyName('')
    setSelectedPerms(['read:all'])
    toast.success('API Key generada. Cópiala ahora — no podrás verla de nuevo.')
  }

  function handleRevoke(id: string) {
    setConfirmRevokeId(id)
  }

  function confirmRevoke() {
    if (!confirmRevokeId) return
    setKeys((prev) => prev.filter((k) => k.id !== confirmRevokeId))
    setConfirmRevokeId(null)
    toast.success('API Key revocada')
  }

  function togglePerm(p: string) {
    setSelectedPerms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gestiona las claves de acceso a la API de Orthonoba</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          <Plus className="w-4 h-4" /> Nueva key
        </button>
      </div>

      {/* Revoke confirm dialog */}
      {confirmRevokeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">¿Revocar API Key?</h3>
            <p className="text-slate-400 text-sm mb-6">Esta acción es irreversible. Las integraciones que usen esta key dejarán de funcionar inmediatamente.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRevokeId(null)} className="flex-1 border border-slate-600 hover:border-slate-500 text-slate-300 rounded-lg py-2.5 text-sm font-medium transition">
                Cancelar
              </button>
              <button onClick={confirmRevoke} className="flex-1 bg-red-500 hover:bg-red-400 text-white rounded-lg py-2.5 text-sm font-semibold transition">
                Revocar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New key alert */}
      {newKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-emerald-400 mb-2">¡API Key generada! Cópiala ahora.</p>
          <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2">
            <code className="text-emerald-300 text-sm font-mono flex-1 break-all">{newKey}</code>
            <button onClick={() => { navigator.clipboard.writeText(newKey); toast.success('Copiada al portapapeles') }} className="text-slate-400 hover:text-white transition shrink-0">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-amber-300/70 mt-2">No podrás ver esta clave de nuevo. Guárdala en un lugar seguro.</p>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="bg-slate-800 border border-sky-500/30 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2"><Key className="w-4 h-4" />Nueva API Key</h3>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Nombre</label>
            <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="Ej: Integración ERP" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-2 block">Permisos</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PERMISSIONS.map((p) => (
                <label key={p} className={['flex items-center gap-2 p-2 rounded-lg cursor-pointer text-xs transition', selectedPerms.includes(p) ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' : 'bg-slate-700/30 text-slate-400 border border-transparent hover:border-slate-600'].join(' ')}>
                  <input type="checkbox" checked={selectedPerms.includes(p)} onChange={() => togglePerm(p)} className="sr-only" />
                  <div className={['w-4 h-4 rounded border flex items-center justify-center shrink-0', selectedPerms.includes(p) ? 'bg-sky-500 border-sky-500' : 'border-slate-500'].join(' ')}>
                    {selectedPerms.includes(p) && <span className="text-white text-[10px]">✓</span>}
                  </div>
                  {p}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 border border-slate-600 text-slate-300 rounded-lg py-2 text-sm hover:border-slate-500 transition">Cancelar</button>
            <button onClick={handleCreate} className="flex-1 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg py-2 text-sm transition">Generar key</button>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div className="space-y-3">
        {keys.map((k) => (
          <div key={k.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <p className="font-medium text-white text-sm">{k.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono text-slate-400 bg-slate-700 px-2 py-0.5 rounded">
                      {showKeys[k.id] ? k.prefix + '••••••••' : k.prefix.slice(0, 8) + '••••••••'}
                    </code>
                    <button onClick={() => setShowKeys((p) => ({ ...p, [k.id]: !p[k.id] }))} className="text-slate-500 hover:text-slate-300 transition">
                      {showKeys[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => handleRevoke(k.id)} className="text-slate-500 hover:text-red-400 transition p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {k.permissions.map((p) => (
                <span key={p} className="bg-slate-700/60 text-slate-400 text-[11px] px-2 py-0.5 rounded-full font-mono">{p}</span>
              ))}
            </div>
            <div className="flex gap-4 text-xs text-slate-500 mt-2">
              <span>Creada: {k.created}</span>
              <span>Último uso: {k.lastUsed}</span>
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Key className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Sin API Keys generadas</p>
          </div>
        )}
      </div>
    </div>
  )
}
