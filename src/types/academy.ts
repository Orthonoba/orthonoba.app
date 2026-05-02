// ─── Academy Categories ───────────────────────────────────────────────────────

export type CourseCategory =
  | 'exocad'
  | 'dental-marketing'
  | 'sleep-dentistry'
  | 'web-design'
  | 'ai-automation'
  | 'clinical-skills'
  | 'practice-management'
  | 'orthodontics'

// ─── Course Access / Pricing ──────────────────────────────────────────────────

export type CourseAccessLevel = 'free' | 'growth' | 'scale' | 'enterprise' | 'purchase-only'

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export type CourseLanguage = 'es' | 'en' | 'pt' | 'ca'

export type CourseStatus = 'draft' | 'published' | 'archived' | 'coming-soon'

// ─── Video ────────────────────────────────────────────────────────────────────

export type VideoProvider = 'youtube' | 'vimeo' | 'mux' | 'bunny' | 'self-hosted'

export interface VideoMetadata {
  provider: VideoProvider
  /** External video ID or signed URL */
  videoId: string
  /** Streaming URL (signed for private providers) */
  streamUrl?: string
  /** Thumbnail */
  thumbnailUrl?: string
  /** Duration in seconds */
  durationSeconds: number
  /** Captions/subtitles available */
  hasSubtitles: boolean
  subtitleLanguages?: CourseLanguage[]
  /** Resolution: '1080p' | '720p' | '480p' */
  quality?: string
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export type QuestionType = 'single' | 'multiple' | 'true-false' | 'short-answer'

export interface QuizAnswer {
  id: string
  text: string
  isCorrect: boolean
  explanation?: string
}

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  answers: QuizAnswer[]
  points: number
  /** Explanation shown after answering */
  explanation?: string
  imageUrl?: string
}

export interface Quiz {
  id: string
  lessonId: string
  courseId: string
  title: string
  questions: QuizQuestion[]
  passingScore: number          // 0–100
  maxAttempts: number
  timeLimitMinutes?: number
  shuffleQuestions: boolean
  shuffleAnswers: boolean
}

// ─── Lesson ───────────────────────────────────────────────────────────────────

export type LessonType = 'video' | 'text' | 'quiz' | 'resource' | 'live-session' | 'assignment'

export interface LessonResource {
  id: string
  name: string
  type: 'pdf' | 'zip' | 'image' | 'link' | 'template'
  url: string
  sizeBytes?: number
}

export interface Lesson {
  id: string
  courseId: string
  sectionId: string
  title: string
  slug: string
  type: LessonType
  /** Display order within section */
  order: number
  /** Summary visible before enrollment */
  description?: string
  /** Full HTML/MDX content for text lessons */
  content?: string
  video?: VideoMetadata
  quiz?: Quiz
  resources?: LessonResource[]
  /** Free preview — visible without enrollment */
  isFreePreview: boolean
  durationMinutes?: number
  /** Live session date (type = live-session) */
  liveAt?: string
  liveUrl?: string
  publishedAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Course Section (Chapter) ─────────────────────────────────────────────────

export interface CourseSection {
  id: string
  courseId: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
  createdAt: string
}

// ─── Instructor ───────────────────────────────────────────────────────────────

export interface Instructor {
  id: string
  /** References User.id */
  userId: string
  name: string
  email: string
  avatar?: string
  title: string
  bio: string
  specialties: CourseCategory[]
  linkedinUrl?: string
  websiteUrl?: string
  /** Total courses authored */
  courseCount: number
  /** Average rating across all courses */
  avgRating: number
  totalStudents: number
  isVerified: boolean
  createdAt: string
  updatedAt?: string
}

// ─── Course ───────────────────────────────────────────────────────────────────

export interface Course {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  /** Short marketing copy (≤160 chars) */
  tagline?: string
  category: CourseCategory
  difficulty: CourseDifficulty
  language: CourseLanguage
  status: CourseStatus

  // Instructors
  instructorIds: string[]
  instructors?: Pick<Instructor, 'id' | 'name' | 'avatar' | 'title'>[]

  // Access / Pricing
  accessLevel: CourseAccessLevel
  /** Price in EUR cents (0 = free) */
  priceCents: number
  /** Original price before discount */
  originalPriceCents?: number
  stripePriceId?: string

  // Media
  thumbnailUrl?: string
  previewVideoUrl?: string
  promoVideoUrl?: string

  // Content structure
  sections: CourseSection[]
  /** Total lessons count (denormalized) */
  totalLessons: number
  /** Total duration in minutes (denormalized) */
  totalMinutes: number

  // Learning outcomes
  learningObjectives: string[]
  requirements: string[]
  targetAudience: string[]
  tags: string[]

  // Stats (denormalized)
  enrollmentCount: number
  completionRate: number
  avgRating: number
  reviewCount: number

  // Certificate
  grantsCertificate: boolean
  certificateTitle?: string

  // SEO
  metaTitle?: string
  metaDescription?: string

  publishedAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Enrollment ───────────────────────────────────────────────────────────────

export type EnrollmentStatus = 'active' | 'completed' | 'expired' | 'refunded' | 'suspended'
export type AccessGrantReason = 'plan-subscription' | 'direct-purchase' | 'admin-grant' | 'free-course' | 'promo-code'

export interface CourseEnrollment {
  id: string
  courseId: string
  userId: string
  /** clinicId of the user at enrollment time */
  clinicId: string | null
  status: EnrollmentStatus
  accessReason: AccessGrantReason
  stripePaymentIntentId?: string
  amountPaidCents: number
  currency: string
  enrolledAt: string
  expiresAt?: string
  completedAt?: string
  lastAccessedAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Lesson Progress ──────────────────────────────────────────────────────────

export type LessonProgressStatus = 'not-started' | 'in-progress' | 'completed'

export interface LessonProgress {
  id: string
  enrollmentId: string
  lessonId: string
  courseId: string
  userId: string
  status: LessonProgressStatus
  /** Video position in seconds */
  videoPositionSeconds?: number
  /** Completion percentage 0–100 */
  percentComplete: number
  completedAt?: string
  lastAccessedAt: string
  /** Number of quiz attempts */
  quizAttempts?: number
  /** Best quiz score 0–100 */
  bestQuizScore?: number
  quizPassedAt?: string
  createdAt: string
  updatedAt?: string
}

// ─── Course Progress (aggregate) ──────────────────────────────────────────────

export interface CourseProgress {
  enrollmentId: string
  courseId: string
  userId: string
  totalLessons: number
  completedLessons: number
  percentComplete: number
  lastLessonId?: string
  lastAccessedAt?: string
  /** Estimated minutes remaining */
  minutesRemaining?: number
  lessonProgress: LessonProgress[]
}

// ─── Quiz Attempt ─────────────────────────────────────────────────────────────

export interface QuizAttempt {
  id: string
  quizId: string
  lessonId: string
  enrollmentId: string
  userId: string
  answers: QuizAttemptAnswer[]
  score: number               // 0–100
  passed: boolean
  attemptNumber: number
  timeTakenSeconds?: number
  submittedAt: string
}

export interface QuizAttemptAnswer {
  questionId: string
  selectedAnswerIds: string[]
  /** For short-answer type */
  textAnswer?: string
  isCorrect: boolean
  pointsEarned: number
}

// ─── Certificate ──────────────────────────────────────────────────────────────

export type CertificateStatus = 'issued' | 'revoked' | 'expired'

export interface Certificate {
  id: string
  /** Public UUID used for verification URL */
  verificationId: string
  enrollmentId: string
  courseId: string
  userId: string
  userName: string
  courseTitle: string
  instructorNames: string[]
  issuedAt: string
  expiresAt?: string
  status: CertificateStatus
  /** PDF URL when generated */
  pdfUrl?: string
  /** Completion score if applicable */
  finalScore?: number
  hoursCompleted: number
  templateId: string
  metadata: Record<string, string>
}

// ─── Course Review ────────────────────────────────────────────────────────────

export interface CourseReview {
  id: string
  courseId: string
  enrollmentId: string
  userId: string
  userName: string
  rating: number              // 1–5
  title?: string
  body?: string
  isVerified: boolean         // verified purchase
  isFeatured: boolean
  createdAt: string
  updatedAt?: string
}

// ─── Live Session ─────────────────────────────────────────────────────────────

export type LiveSessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'

export interface LiveSession {
  id: string
  courseId: string
  lessonId: string
  instructorId: string
  title: string
  description?: string
  status: LiveSessionStatus
  scheduledAt: string
  durationMinutes: number
  maxAttendees?: number
  registeredCount: number
  joinUrl?: string
  recordingUrl?: string
  platform: 'zoom' | 'google-meet' | 'teams' | 'jitsi'
  createdAt: string
}

// ─── Academy Dashboard ────────────────────────────────────────────────────────

export interface AcademyDashboardKPIs {
  userId: string
  totalEnrollments: number
  completedCourses: number
  inProgressCourses: number
  totalCertificates: number
  totalMinutesLearned: number
  currentStreak: number        // learning days
  longestStreak: number
  avgCourseScore: number
  categoryProgress: { category: CourseCategory; completed: number; total: number }[]
  recentActivity: { courseId: string; courseTitle: string; lessonTitle: string; accessedAt: string }[]
}
