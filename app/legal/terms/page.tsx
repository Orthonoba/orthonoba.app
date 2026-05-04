import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio — Orthonoba',
  description: 'Condiciones generales de uso y contratación de la plataforma Orthonoba.',
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Términos de Servicio</h1>
      <p className="text-sm text-slate-500 mb-10">Última actualización: mayo 2026</p>

      <section className="space-y-6 text-slate-700 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold mb-2">1. Objeto</h2>
          <p>
            Orthonoba es una plataforma SaaS de gestión clínico-dental y CRM dirigida a clínicas, laboratorios
            y profesionales del sector odontológico. El acceso y uso del servicio implica la aceptación
            de estos términos.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">2. Cuenta y acceso</h2>
          <p>
            El usuario es responsable de mantener la confidencialidad de sus credenciales. Cada suscripción
            está asociada a un tenant (clínica u organización) con dominio propio en <code className="bg-slate-100 px-1 rounded text-sm">{'{sub}'}.orthonoba.app</code>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">3. Planes y facturación</h2>
          <p>
            Los planes (Starter, Growth, Scale, Enterprise) se facturan mensual o anualmente mediante
            Stripe. Los precios incluyen IVA cuando corresponde. La cancelación surte efecto al final
            del período de facturación en curso.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">4. Datos de salud</h2>
          <p>
            Las clínicas son responsables del tratamiento de los datos de salud de sus pacientes.
            Orthonoba actúa como encargado del tratamiento (Art. 28 RGPD) y se compromete a tratar
            dichos datos únicamente según las instrucciones documentadas en el DPA.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">5. Propiedad intelectual</h2>
          <p>
            El software, diseño y documentación de Orthonoba son propiedad de Orthonoba SL.
            Los datos introducidos por el cliente son de su exclusiva propiedad y pueden exportarse
            en cualquier momento.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">6. Limitación de responsabilidad</h2>
          <p>
            Orthonoba no se hace responsable de decisiones clínicas tomadas en base a la información
            gestionada en la plataforma. La plataforma es una herramienta de gestión, no un dispositivo
            sanitario certificado.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">7. Ley aplicable</h2>
          <p>
            Estos términos se rigen por la ley española. Cualquier controversia se someterá a los
            juzgados y tribunales de Madrid, salvo que la normativa de consumo establezca otro fuero.
          </p>
        </div>
      </section>
    </main>
  )
}
