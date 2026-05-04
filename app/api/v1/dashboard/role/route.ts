import { NextResponse } from 'next/server'
import { withTenant } from '@/src/middleware/with-tenant'
import { getClinicDashboard } from '@/src/services/dashboard/clinic-dashboard'
import { getLabDashboard } from '@/src/services/dashboard/lab-dashboard'

import { getExecutiveReport } from '@/src/services/dashboard/executive-report'
import { listLeads } from '@/src/modules/marketing/lead-store'
import { listReminders } from '@/src/modules/automation/automation-store'
import { getAcademyDashboard } from '@/src/modules/academy/enrollment-store'
import { listInstructors, listCourses } from '@/src/modules/academy/course-store'
import { currentPeriod } from '@/src/modules/dashboard/dashboard-store'
import { ok, fail, HTTP_STATUS } from '@/src/types/api'
import type { DoctorDashboard, StaffDashboard, InstructorDashboard } from '@/src/types/dashboard'

// GET /api/v1/dashboard/role — auto-routes to the right dashboard by session.role
export const GET = withTenant(async (req, { tenant, session }) => {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? currentPeriod()

  switch (session.role) {
    case 'super_admin': {
      const report = await getExecutiveReport(period)
      return NextResponse.json(ok({ role: 'super_admin', data: report }))
    }

    case 'clinic_admin': {
      const dashboard = await getClinicDashboard(tenant.clinicId, tenant.clinicName, tenant.plan, period)
      return NextResponse.json(ok({ role: 'clinic_admin', data: dashboard }))
    }

    case 'lab_admin': {
      const dashboard = await getLabDashboard(tenant.clinicId, tenant.clinicName, tenant.plan, period)
      return NextResponse.json(ok({ role: 'lab_admin', data: dashboard }))
    }

    case 'doctor': {
      const [_leadsResult, reminders, academyKPIs] = await Promise.all([
        listLeads(tenant.clinicId, { limit: 50 }),
        listReminders(tenant.clinicId),
        getAcademyDashboard(session.userId),
      ])

      const docDashboard: DoctorDashboard = {
        userId: session.userId,
        clinicId: tenant.clinicId,
        period,
        generatedAt: new Date().toISOString(),
        todayAppointments: 0,
        pendingOrders: 0,
        activePatients: 0,
        pendingTasks: reminders.filter((r) => r.status === 'scheduled').length,
        recentPatients: [],
        ordersInProgress: [],
        academy: {
          inProgress: academyKPIs.inProgressCourses,
          completed: academyKPIs.completedCourses,
          certificates: academyKPIs.totalCertificates,
        },
      }
      return NextResponse.json(ok({ role: 'doctor', data: docDashboard }))
    }

    case 'staff': {
      const [leadsResult, reminders] = await Promise.all([
        listLeads(tenant.clinicId, { status: 'new', limit: 10 }),
        listReminders(tenant.clinicId),
      ])

      const staffDashboard: StaffDashboard = {
        userId: session.userId,
        clinicId: tenant.clinicId,
        generatedAt: new Date().toISOString(),
        todaySchedule: 0,
        pendingCheckIns: 0,
        pendingPayments: 0,
        pendingReminders: reminders.filter((r) => r.status === 'scheduled').length,
        recentLeads: leadsResult.data.map((l) => ({
          leadId: l.id,
          name: l.name,
          source: l.source,
          score: l.score ?? 0,
          createdAt: l.createdAt,
        })),
        urgentTasks: [],
      }
      return NextResponse.json(ok({ role: 'staff', data: staffDashboard }))
    }

    case 'instructor': {
      const allInstructors = await listInstructors()
      const myInstructor   = allInstructors.find((i) => i.userId === session.userId)
      const { data: myCourses } = await listCourses({ instructorId: myInstructor?.id, limit: 100 })

      const instrDashboard: InstructorDashboard = {
        userId: session.userId,
        generatedAt: new Date().toISOString(),
        totalCourses: myCourses.length,
        totalStudents: myCourses.reduce((s, c) => s + c.enrollmentCount, 0),
        completedStudents: 0,
        pendingReviews: 0,
        avgRating: myInstructor?.avgRating ?? 0,
        totalCertificatesIssued: 0,
        totalRevenueEurCents: 0,
        topCourses: myCourses
          .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
          .slice(0, 5)
          .map((c) => ({
            courseId: c.id,
            title: c.title,
            enrollments: c.enrollmentCount,
            completionRate: c.completionRate,
            avgRating: c.avgRating,
          })),
        recentActivity: [],
      }
      return NextResponse.json(ok({ role: 'instructor', data: instrDashboard }))
    }

    default:
      return NextResponse.json(fail('FORBIDDEN', 'Rol sin dashboard asignado.'), { status: HTTP_STATUS.FORBIDDEN })
  }
})
