import Image from 'next/image'
import type { Metadata } from 'next'
import { LoginForm } from '@/src/components/ui/login-form'

export const metadata: Metadata = {
  title: 'Iniciar sesión — Orthonoba',
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-md px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-orthonoba.png"
            alt="Orthonoba"
            width={160}
            height={52}
            className="h-auto"
            priority
          />
        </div>

        <h1 className="text-xl font-semibold text-slate-900 mb-1">Bienvenido</h1>
        <p className="text-sm text-slate-500 mb-6">Ingresa a tu cuenta Orthonoba</p>

        <LoginForm />

        <p className="mt-6 text-xs text-slate-400 text-center">
          Demo: admin@orthonoba.app / admin123
        </p>
      </div>
    </div>
  )
}
