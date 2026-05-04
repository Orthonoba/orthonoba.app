import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies — Orthonoba',
  description: 'Información sobre el uso de cookies en la plataforma Orthonoba.',
}

export default function CookiesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Política de Cookies</h1>
      <p className="text-sm text-slate-500 mb-10">Última actualización: mayo 2026 · Conforme a la LSSI-CE y directiva ePrivacy</p>

      <section className="space-y-6 text-slate-700 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold mb-2">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que los sitios web almacenan en el navegador
            del usuario para recordar preferencias o gestionar sesiones.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Cookies utilizadas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 pr-4 font-semibold">Nombre</th>
                  <th className="text-left py-2 pr-4 font-semibold">Tipo</th>
                  <th className="text-left py-2 pr-4 font-semibold">Duración</th>
                  <th className="text-left py-2 font-semibold">Finalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">session</td>
                  <td className="py-2 pr-4">Esencial</td>
                  <td className="py-2 pr-4">Sesión</td>
                  <td className="py-2">Autenticación JWT del usuario</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">locale</td>
                  <td className="py-2 pr-4">Funcional</td>
                  <td className="py-2 pr-4">1 año</td>
                  <td className="py-2">Preferencia de idioma</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-xs">_stripe_*</td>
                  <td className="py-2 pr-4">Terceros</td>
                  <td className="py-2 pr-4">Variable</td>
                  <td className="py-2">Procesamiento de pagos (Stripe)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Gestión de cookies</h2>
          <p>
            Las cookies esenciales no pueden desactivarse ya que son necesarias para el funcionamiento
            del servicio. El resto pueden bloquearse desde la configuración de su navegador. La
            desactivación de cookies funcionales puede afectar a la experiencia de uso.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Contacto</h2>
          <p>
            Para cualquier consulta sobre el uso de cookies: <a href="mailto:privacidad@orthonoba.app" className="text-sky-600 hover:underline">privacidad@orthonoba.app</a>
          </p>
        </div>
      </section>
    </main>
  )
}
