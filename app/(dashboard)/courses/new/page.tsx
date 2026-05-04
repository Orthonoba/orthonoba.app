'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Plus, Trash2, Upload, ChevronUp, ChevronDown, ArrowLeft, BookOpen } from 'lucide-react'

const CATEGORIES = ['Ortodoncia', 'CAD/CAM', 'Marketing', 'Implantología', 'Cirugía', 'Prótesis', 'Gestión Clínica', 'Radiología']
const LEVELS = ['Básico', 'Intermedio', 'Avanzado']

interface Section {
  id: string
  title: string
  lessons: string[]
}

export default function NewCoursePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [level, setLevel] = useState(LEVELS[0])
  const [price, setPrice] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [sections, setSections] = useState<Section[]>([
    { id: '1', title: 'Módulo 1: Introducción', lessons: ['Bienvenida al curso', 'Requisitos previos'] },
  ])
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  function handleThumbnail(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function addSection() {
    const id = Date.now().toString()
    setSections((prev) => [...prev, { id, title: `Módulo ${prev.length + 1}: Nuevo módulo`, lessons: [] }])
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  function updateSectionTitle(id: string, val: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, title: val } : s)))
  }

  function addLesson(sectionId: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: [...s.lessons, 'Nueva lección'] } : s
      )
    )
  }

  function updateLesson(sectionId: string, idx: number, val: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, lessons: s.lessons.map((l, i) => (i === idx ? val : l)) }
          : s
      )
    )
  }

  function removeLesson(sectionId: string, idx: number) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, lessons: s.lessons.filter((_, i) => i !== idx) } : s
      )
    )
  }

  function moveSectionUp(idx: number) {
    if (idx === 0) return
    setSections((prev) => {
      const copy = [...prev]
      ;[copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]]
      return copy
    })
  }

  function moveSectionDown(idx: number) {
    setSections((prev) => {
      if (idx === prev.length - 1) return prev
      const copy = [...prev]
      ;[copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]]
      return copy
    })
  }

  async function handleSave() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/courses" className="text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Crear nuevo curso</h1>
            <p className="text-slate-400 text-sm mt-0.5">Completa la información para publicar tu curso en la Academia Orthonoba</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" /> Información básica
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Título del curso *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Ortodoncia Digital Avanzada"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe el contenido y objetivos del curso..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Nivel</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500"
                  >
                    {LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Precio</label>
                <div className="flex gap-3 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFree}
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="w-4 h-4 rounded accent-sky-500"
                    />
                    <span className="text-sm text-slate-300">Curso gratuito</span>
                  </label>
                  {!isFree && (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-slate-400 text-sm">€</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Temario del curso</h2>
                <button
                  onClick={addSection}
                  className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition"
                >
                  <Plus className="w-4 h-4" /> Añadir módulo
                </button>
              </div>
              <div className="space-y-4">
                {sections.map((section, sIdx) => (
                  <div key={section.id} className="bg-slate-900 border border-slate-600 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-2 p-3 bg-slate-800/50">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSectionUp(sIdx)} className="text-slate-500 hover:text-slate-300">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveSectionDown(sIdx)} className="text-slate-500 hover:text-slate-300">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        className="flex-1 bg-transparent text-white font-medium text-sm focus:outline-none border-b border-transparent focus:border-sky-500 pb-0.5"
                      />
                      <button onClick={() => removeSection(section.id)} className="text-slate-500 hover:text-red-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 space-y-2">
                      {section.lessons.map((lesson, lIdx) => (
                        <div key={lIdx} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
                          <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center font-medium flex-shrink-0">
                            {lIdx + 1}
                          </span>
                          <input
                            value={lesson}
                            onChange={(e) => updateLesson(section.id, lIdx, e.target.value)}
                            className="flex-1 bg-transparent text-sm text-slate-300 focus:outline-none"
                          />
                          <button onClick={() => removeLesson(section.id, lIdx)} className="text-slate-600 hover:text-red-400 transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addLesson(section.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition ml-7"
                      >
                        <Plus className="w-3.5 h-3.5" /> Añadir lección
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Thumbnail */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-3">Imagen del curso</h3>
              <label className="aspect-video bg-slate-900 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-sky-500 transition group overflow-hidden">
                <input type="file" accept="image/*" className="sr-only" onChange={handleThumbnail} />
                {thumbnailPreview ? (
                  <Image src={thumbnailPreview} alt="Thumbnail preview" fill className="object-cover" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-500 group-hover:text-sky-400 transition" />
                    <p className="text-xs text-slate-500 group-hover:text-slate-400 transition text-center">
                      Haz clic para subir<br />
                      <span className="text-slate-600">PNG, JPG — max 2MB</span>
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* Course summary */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-white">Resumen</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Categoría</span>
                  <span className="text-white">{category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nivel</span>
                  <span className="text-white">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Módulos</span>
                  <span className="text-white">{sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lecciones</span>
                  <span className="text-white">{sections.reduce((acc, s) => acc + s.lessons.length, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Precio</span>
                  <span className="text-white font-semibold">{isFree ? 'Gratis' : price ? `€${price}` : '—'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
              >
                {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Publicar curso'}
              </button>
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 rounded-xl transition text-sm">
                Guardar borrador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
