import { NextResponse } from 'next/server'
import { deleteSession } from '@/src/lib/auth'
import { ok } from '@/src/types/api'

export async function POST() {
  await deleteSession()
  return NextResponse.json(ok({ message: 'Sesión cerrada.' }), { status: 200 })
}
