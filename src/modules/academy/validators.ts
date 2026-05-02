import { z } from 'zod'

// ─── Video ────────────────────────────────────────────────────────────────────

export const videoMetadataSchema = z.object({
  provider:         z.enum(['youtube', 'vimeo', 'mux', 'bunny', 'self-hosted']),
  videoId:          z.string().min(1),
  streamUrl:        z.string().url().optional(),
  thumbnailUrl:     z.string().url().optional(),
  durationSeconds:  z.number().int().positive(),
  hasSubtitles:     z.boolean().default(false),
  subtitleLanguages: z.array(z.enum(['es', 'en', 'pt', 'ca'])).optional(),
  quality:          z.string().optional(),
})

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const quizAnswerSchema = z.object({
  id:          z.string().uuid(),
  text:        z.string().min(1).max(500),
  isCorrect:   z.boolean(),
  explanation: z.string().max(1000).optional(),
})

const quizQuestionSchema = z.object({
  id:          z.string().uuid(),
  type:        z.enum(['single', 'multiple', 'true-false', 'short-answer']),
  question:    z.string().min(1).max(1000),
  answers:     z.array(quizAnswerSchema).min(2).max(6),
  points:      z.number().int().positive().default(1),
  explanation: z.string().max(1000).optional(),
  imageUrl:    z.string().url().optional(),
})

export const createQuizSchema = z.object({
  title:            z.string().min(1).max(200),
  questions:        z.array(quizQuestionSchema).min(1).max(50),
  passingScore:     z.number().int().min(0).max(100).default(70),
  maxAttempts:      z.number().int().positive().default(3),
  timeLimitMinutes: z.number().int().positive().optional(),
  shuffleQuestions: z.boolean().default(false),
  shuffleAnswers:   z.boolean().default(true),
})

export const submitQuizSchema = z.object({
  answers: z.array(z.object({
    questionId:       z.string().uuid(),
    selectedAnswerIds: z.array(z.string().uuid()).max(6),
    textAnswer:       z.string().max(2000).optional(),
  })).min(1),
  timeTakenSeconds: z.number().int().positive().optional(),
})

// ─── Lesson ───────────────────────────────────────────────────────────────────

const lessonResourceSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['pdf', 'zip', 'image', 'link', 'template']),
  url:  z.string().url(),
  sizeBytes: z.number().int().positive().optional(),
})

export const createLessonSchema = z.object({
  title:          z.string().min(1).max(300),
  slug:           z.string().min(1).max(300).regex(/^[a-z0-9-]+$/, 'Solo minúsculas y guiones'),
  type:           z.enum(['video', 'text', 'quiz', 'resource', 'live-session', 'assignment']),
  order:          z.number().int().nonnegative().default(0),
  description:    z.string().max(1000).optional(),
  content:        z.string().optional(),
  video:          videoMetadataSchema.optional(),
  resources:      z.array(lessonResourceSchema).max(20).optional(),
  isFreePreview:  z.boolean().default(false),
  durationMinutes: z.number().int().positive().optional(),
  liveAt:         z.string().datetime({ offset: true }).optional(),
  liveUrl:        z.string().url().optional(),
})

export const updateLessonProgressSchema = z.object({
  videoPositionSeconds: z.number().int().nonnegative().optional(),
  percentComplete:      z.number().min(0).max(100).optional(),
})

// ─── Section ──────────────────────────────────────────────────────────────────

export const createSectionSchema = z.object({
  title:       z.string().min(1).max(300),
  description: z.string().max(1000).optional(),
  order:       z.number().int().nonnegative().default(0),
})

// ─── Course ───────────────────────────────────────────────────────────────────

export const createCourseSchema = z.object({
  slug:        z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'Solo minúsculas y guiones'),
  title:       z.string().min(1).max(300),
  subtitle:    z.string().max(300).optional(),
  description: z.string().min(1).max(5000),
  tagline:     z.string().max(160).optional(),
  category: z.enum([
    'exocad', 'dental-marketing', 'sleep-dentistry', 'web-design', 'ai-automation',
    'clinical-skills', 'practice-management', 'orthodontics',
  ]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  language:   z.enum(['es', 'en', 'pt', 'ca']).default('es'),
  accessLevel: z.enum(['free', 'growth', 'scale', 'enterprise', 'purchase-only']),
  priceCents:         z.number().int().nonnegative().default(0),
  originalPriceCents: z.number().int().nonnegative().optional(),
  stripePriceId:      z.string().optional(),
  thumbnailUrl:    z.string().url().optional(),
  previewVideoUrl: z.string().url().optional(),
  promoVideoUrl:   z.string().url().optional(),
  learningObjectives: z.array(z.string().max(300)).min(1).max(10),
  requirements:       z.array(z.string().max(300)).max(10).default([]),
  targetAudience:     z.array(z.string().max(300)).max(5).default([]),
  tags:               z.array(z.string().max(50)).max(15).default([]),
  instructorIds:      z.array(z.string().uuid()).min(1),
  grantsCertificate:  z.boolean().default(true),
  certificateTitle:   z.string().max(200).optional(),
  metaTitle:          z.string().max(60).optional(),
  metaDescription:    z.string().max(160).optional(),
})

export const updateCourseSchema = createCourseSchema.partial().omit({ slug: true })

// ─── Enrollment ───────────────────────────────────────────────────────────────

export const enrollSchema = z.object({
  /** Stripe payment intent ID for paid courses */
  paymentIntentId: z.string().optional(),
  promoCode:       z.string().max(50).optional(),
})

// ─── Instructor ───────────────────────────────────────────────────────────────

export const createInstructorSchema = z.object({
  userId:       z.string().uuid(),
  name:         z.string().min(1).max(200),
  email:        z.string().email(),
  title:        z.string().min(1).max(200),
  bio:          z.string().min(1).max(2000),
  specialties: z.array(z.enum([
    'exocad', 'dental-marketing', 'sleep-dentistry', 'web-design', 'ai-automation',
    'clinical-skills', 'practice-management', 'orthodontics',
  ])).min(1),
  avatar:       z.string().url().optional(),
  linkedinUrl:  z.string().url().optional(),
  websiteUrl:   z.string().url().optional(),
})

// ─── Review ───────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title:  z.string().max(200).optional(),
  body:   z.string().max(2000).optional(),
})

// ─── Inferred types ───────────────────────────────────────────────────────────

export type CreateCourseInput       = z.infer<typeof createCourseSchema>
export type UpdateCourseInput       = z.infer<typeof updateCourseSchema>
export type CreateSectionInput      = z.infer<typeof createSectionSchema>
export type CreateLessonInput       = z.infer<typeof createLessonSchema>
export type CreateQuizInput         = z.infer<typeof createQuizSchema>
export type SubmitQuizInput         = z.infer<typeof submitQuizSchema>
export type EnrollInput             = z.infer<typeof enrollSchema>
export type CreateInstructorInput   = z.infer<typeof createInstructorSchema>
export type CreateReviewInput       = z.infer<typeof createReviewSchema>
export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>
