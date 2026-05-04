import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Protección de Datos — Orthonoba',
  description: 'Acuerdo de protección de datos y tratamiento de datos sanitarios en Orthonoba.',
}

export default function DataProtectionPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Protección de Datos Sanitarios</h1>
      <p className="text-sm text-slate-500 mb-10">DPA (Data Processing Agreement) · Mayo 2026 · Art. 28 RGPD</p>

      <section className="space-y-6 text-slate-700 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold mb-2">1. Marco legal</h2>
          <p>
            El tratamiento de datos en el ámbito de la salud está sujeto al RGPD (UE) 2016/679,
            la LOPDGDD (Ley Orgánica 3/2018) y la Ley 41/2002 de autonomía del paciente.
            Los datos dentales/odontológicos constituyen datos de salud (categoría especial, Art. 9 RGPD).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">2. Roles de tratamiento</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li><strong>Clínica / Laboratorio</strong>: Responsable del tratamiento de datos de sus pacientes</li>
            <li><strong>Orthonoba SL</strong>: Encargado del tratamiento (accede a datos únicamente para prestar el servicio)</li>
            <li><strong>Subencargados</strong>: Hetzner (infraestructura), Stripe (pagos) — todos con DPA vigente</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">3. Medidas técnicas y organizativas</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Cifrado en tránsito (TLS 1.3) y en reposo (AES-256)</li>
            <li>Aislamiento de datos por tenant (clinicId en todas las consultas)</li>
            <li>Control de acceso basado en roles (RBAC) con JWT edge-safe</li>
            <li>Logs de auditoría para accesos a datos de pacientes</li>
            <li>Backups cifrados con retención configurable</li>
            <li>Política de contraseñas y 2FA opcional para cuentas administrativas</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">4. Obligaciones del encargado (Orthonoba)</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Tratar los datos únicamente según instrucciones documentadas del responsable</li>
            <li>No ceder datos a terceros sin autorización expresa</li>
            <li>Notificar brechas de seguridad en un máximo de 72 horas</li>
            <li>Facilitar auditorías e inspecciones del responsable o autoridades</li>
            <li>Suprimir o devolver los datos al finalizar el contrato</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">5. Historial clínico digital</h2>
          <p>
            Los archivos STL, radiografías y registros clínicos se almacenan en buckets de almacenamiento
            seguro con acceso firmado y de corta duración. Los archivos de impresiones 3D son datos
            biométricos bajo Art. 9 RGPD y se tratan con protección reforzada.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">6. Contacto DPO</h2>
          <p>
            Delegado de Protección de Datos: <a href="mailto:dpo@orthonoba.app" className="text-sky-600 hover:underline">dpo@orthonoba.app</a>
          </p>
        </div>
      </section>
    </main>
  )
}
