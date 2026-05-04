import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Orthonoba',
  description: 'Política de privacidad y tratamiento de datos personales de Orthonoba, conforme al RGPD.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
      <p className="text-sm text-slate-500 mb-10">Última actualización: mayo 2026 · Conforme al RGPD (UE) 2016/679</p>

      <section className="space-y-6 text-slate-700 leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold mb-2">1. Responsable del tratamiento</h2>
          <p>
            Orthonoba SL, con domicilio en España, es el responsable del tratamiento de los datos personales
            recogidos a través de esta plataforma. Contacto DPO: <a href="mailto:privacidad@orthonoba.app" className="text-sky-600 hover:underline">privacidad@orthonoba.app</a>
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">2. Datos recogidos</h2>
          <p>
            Recogemos datos de identificación (nombre, email, teléfono), datos profesionales (clínica, especialidad),
            datos de facturación y, en el contexto clínico dental, datos de salud de pacientes tratados por
            los profesionales que usan la plataforma. Los datos de salud son categoría especial (Art. 9 RGPD)
            y se tratan con garantías reforzadas.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">3. Finalidades y base jurídica</h2>
          <ul className="list-disc ml-5 space-y-1">
            <li>Prestación del servicio SaaS contratado — base: ejecución de contrato (Art. 6.1.b)</li>
            <li>Gestión de pacientes por parte de la clínica — base: interés legítimo sanitario (Art. 9.2.h)</li>
            <li>Facturación y cumplimiento fiscal — base: obligación legal (Art. 6.1.c)</li>
            <li>Comunicaciones comerciales — base: consentimiento (Art. 6.1.a)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">4. Encargados de tratamiento</h2>
          <p>
            Orthonoba actúa como encargado del tratamiento para los datos de pacientes aportados por las
            clínicas (responsables). Disponemos de DPA firmado con todos los subencargados (infraestructura,
            pagos, comunicaciones).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">5. Transferencias internacionales</h2>
          <p>
            Los datos se alojan en servidores dentro de la UE (Hetzner, Fráncfort). Cualquier transferencia
            fuera del EEE se realiza con garantías adecuadas (cláusulas contractuales tipo).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">6. Conservación</h2>
          <p>
            Los datos se conservan mientras dure la relación contractual y los plazos legales aplicables
            (5 años para datos fiscales, 5 años para datos de salud como mínimo según normativa sanitaria).
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">7. Derechos</h2>
          <p>
            Puede ejercer sus derechos de acceso, rectificación, supresión, portabilidad, limitación y oposición
            escribiendo a <a href="mailto:privacidad@orthonoba.app" className="text-sky-600 hover:underline">privacidad@orthonoba.app</a>.
            También puede presentar reclamación ante la AEPD (aepd.es).
          </p>
        </div>
      </section>
    </main>
  )
}
