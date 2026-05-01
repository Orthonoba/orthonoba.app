import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-orthonoba.png"
            alt="Orthonoba Logo"
            width={180}
            height={60}
            className="h-auto w-auto"
            priority
          />
        </Link>

        {/* Menu */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <Link href="/">Inicio</Link>
          <Link href="/servicios">Servicios</Link>
          <Link href="/sobre-nosotros">Nosotros</Link>
          <Link href="/contacto">Contacto</Link>
        </div>

        {/* CTA */}
        <Link
          href="/contacto"
          className="rounded-xl bg-black text-white px-4 py-2 text-sm"
        >
          Agenda Demo
        </Link>
      </nav>
    </header>
  );
}
