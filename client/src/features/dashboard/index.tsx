import React from 'react'
import {
  Users,
  Bed,
  FileText,
  Calendar,
  Activity,
  Building2,
  Clock,
  Coins,
} from 'lucide-react'
import Chart from 'react-apexcharts'
import { useProfile } from '@/api/hooks/useAuth'
import { useDashboardStats, useRevenueTrends } from '@/api/hooks/useDashboard'
import { useBreadcrumb } from '@/hooks/useBreadCrumb'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import AppointmentCardComponent from './components/AppointmentCard'
import StatCard from './components/StatCard'
import getUserRole from '@/lib/get-user-role'


const CircularProgress = ({
  value,
  total,
  size = 120,
  strokeWidth = 8,
}: {
  value: number
  total: number
  size?: number
  strokeWidth?: number
}) => {
  const percentage =
    total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width={size} height={size} className='-rotate-90 transform'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='none'
          className='text-muted'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={strokeDasharray}
          className='text-primary transition-all duration-300 ease-in-out'
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-2xl font-bold'>{percentage}%</span>
      </div>
    </div>
  )
}

export const Dashboard = () => {
  useBreadcrumb([{ link: '/', title: 'Dashboard' }])
  const { data: profile } = useProfile()
  const role = getUserRole().toUpperCase()


  const { data: stats, isLoading: isLoadingStats } = useDashboardStats()
  const [period, setPeriod] = React.useState<'7d' | '30d' | '90d'>('30d')
  const { data: revenue, error: revError } = useRevenueTrends({ period })

  const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : 30
  const revenueMap = new Map<string, number>()
    ; (revenue || []).forEach((r: any) => {
      revenueMap.set(String(r.date), Number(r.revenue) || 0)
    })

  const linePoints = Array.from({ length: periodDays }).map((_, idx) => {
    const d = new Date()
    d.setDate(d.getDate() - (periodDays - 1 - idx))
    const key = d.toISOString().slice(0, 10)
    return revenueMap.get(key) || 0
  })

  const lineLabels = Array.from({ length: periodDays }).map((_, idx) => {
    const d = new Date()
    d.setDate(d.getDate() - (periodDays - 1 - idx))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const apexLineOptions = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: true },
      background: 'transparent',
    },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: lineLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: (v: number) => `Rs ${v.toLocaleString()}` },
    },
    dataLabels: { enabled: false },
    colors: ['hsl(var(--primary))'],
    grid: {
      strokeDashArray: 4,
      borderColor: 'hsl(var(--border))',
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: (v: number) => `Rs ${v.toLocaleString()}`,
      },
    },
  } as any

  const apexLineSeries = [{ name: 'Revenue', data: linePoints }]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const userName = (profile as any)?.data?.user?.firstName || 'User'

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          {getGreeting()}, {userName}
        </h1>
        <p className='text-muted-foreground'>
          Here's what's happening with your {role.toLowerCase()} dashboard
          today.
        </p>
      </div>

      {/* Admin Dashboard */}
      {role === 'ADMIN' && (
        <>
          {/* KPI Cards */}
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <StatCard
              title='Total Patients'
              value={
                isLoadingStats
                  ? '—'
                  : (stats?.totalPatients ?? 0).toLocaleString()
              }
              icon={Users}
              description='Total registered patients in the system'
              isLoading={isLoadingStats}
            />
            <StatCard
              title='Occupied Beds'
              value={
                isLoadingStats
                  ? '—'
                  : `${stats?.occupiedBeds ?? 0}/${stats?.totalBeds ?? 0}`
              }
              icon={Bed}
              description='Current bed occupancy rate and availability'
              isLoading={isLoadingStats}
            />
            <StatCard
              title='Pending Bills'
              value={
                isLoadingStats
                  ? '—'
                  : (stats?.pendingBills ?? 0).toLocaleString()
              }
              icon={FileText}
              description='Bills awaiting payment from patients'
              isLoading={isLoadingStats}
            />
            <StatCard
              title="Today's Appointments"
              value={
                isLoadingStats
                  ? '—'
                  : (stats?.todayAppointments ?? 0).toLocaleString()
              }
              icon={Calendar}
              description='Scheduled appointments for today'
              isLoading={isLoadingStats}
            />
          </div>

          {/* Charts Section */}
          <div className='grid gap-4 lg:grid-cols-3'>
            {/* Revenue Chart */}
            <Card className='lg:col-span-2'>
              <CardHeader className='flex flex-row items-center justify-between space-y-0'>
                <div className='space-y-1'>
                  <CardTitle className='flex items-center gap-2'>
                    <Coins className='h-5 w-5' />
                    Revenue Overview
                  </CardTitle>
                  <p className='text-muted-foreground text-sm'>
                    Track your revenue performance over time
                  </p>
                </div>
                <Select
                  value={period}
                  onValueChange={(v) => setPeriod(v as any)}
                >
                  <SelectTrigger className='w-36'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='7d'>Last 7 days</SelectItem>
                    <SelectItem value='30d'>Last 30 days</SelectItem>
                    <SelectItem value='90d'>Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {revError ? (
                  <div className='text-destructive flex h-48 items-center justify-center'>
                    <p>Error loading revenue data</p>
                  </div>
                ) : (
                  <Chart
                    options={apexLineOptions}
                    series={apexLineSeries}
                    type='line'
                    height={250}
                  />
                )}
              </CardContent>
            </Card>

            {/* Bed Occupancy */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Bed Occupancy
                </CardTitle>
                <p className='text-muted-foreground text-sm'>
                  Current bed utilization rate
                </p>
              </CardHeader>
              <CardContent className='flex flex-col items-center space-y-4'>
                <CircularProgress
                  value={stats?.occupiedBeds ?? 0}
                  total={stats?.totalBeds ?? 0}
                />
                <div className='grid w-full grid-cols-2 gap-4 text-center'>
                  <div>
                    <p className='text-primary text-2xl font-bold'>
                      {stats?.occupiedBeds ?? 0}
                    </p>
                    <p className='text-muted-foreground text-xs'>Occupied</p>
                  </div>
                  <div>
                    <p className='text-2xl font-bold'>
                      {stats?.totalBeds ?? 0}
                    </p>
                    <p className='text-muted-foreground text-xs'>Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department and Recent Appointments */}
          <div className='grid gap-4 lg:grid-cols-3'>
            {/* Department Stats */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Building2 className='h-5 w-5' />
                  Departments
                </CardTitle>
                <p className='text-muted-foreground text-sm'>
                  Patient distribution by department
                </p>
              </CardHeader>
              <CardContent className='space-y-3'>
                {(stats?.departmentStats || []).map((dept) => (
                  <div
                    key={dept.department}
                    className='bg-muted/50 flex items-center justify-between rounded-lg p-3'
                  >
                    <span className='font-medium'>{dept.department}</span>
                    <Badge variant='secondary'>{dept.patientCount}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Appointments */}
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Clock className='h-5 w-5' />
                  Recent Appointments
                </CardTitle>
                <p className='text-muted-foreground text-sm'>
                  Latest scheduled appointments
                </p>
              </CardHeader>
              <CardContent className='space-y-3'>
                {(stats?.recentAppointments || [])
                  .slice(0, 5)
                  .map((appointment: any) => (
                    <AppointmentCardComponent
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))}
                {(stats?.recentAppointments || []).length === 0 && (
                  <div className='text-muted-foreground py-8 text-center'>
                    No recent appointments found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Doctor Dashboard */}
      {role === 'DOCTOR' && (
        <div className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <StatCard
              title="Today's Appointments"
              value={stats?.todayAppointments ?? 0}
              icon={Calendar}
              description='Your scheduled appointments for today'
              isLoading={isLoadingStats}
            />
            <StatCard
              title='Patients Under Care'
              value={stats?.totalPatients ?? 0}
              icon={Users}
              description='Total patients currently under your care'
              isLoading={isLoadingStats}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                My Recent Appointments
              </CardTitle>
              <p className='text-muted-foreground text-sm'>
                Your upcoming and recent patient consultations
              </p>
            </CardHeader>
            <CardContent className='space-y-3'>
              {(stats?.recentAppointments || []).map((appointment: any) => (
                <AppointmentCardComponent
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
              {(stats?.recentAppointments || []).length === 0 && (
                <div className='text-muted-foreground py-8 text-center'>
                  No recent appointments found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}


      {/* Patient Dashboard */}
      {role === 'PATIENT' && (
        <div className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-3'>
            <StatCard
              title='Pending Bills'
              value={`Rs ${(stats?.pendingBills ?? 0).toLocaleString()}`}
              icon={FileText}
              description='Your outstanding bills awaiting payment'
              isLoading={isLoadingStats}
            />
            <StatCard
              title='Total Appointments'
              value={stats?.totalAppointments ?? 0}
              icon={Calendar}
              description='All your scheduled appointments'
              isLoading={isLoadingStats}
            />
            <StatCard
              title='Medical Records'
              value={stats?.totalMedicalRecords ?? 0}
              icon={Activity}
              description='Total medical records and reports'
              isLoading={isLoadingStats}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5' />
                My Recent Appointments
              </CardTitle>
              <p className='text-muted-foreground text-sm'>
                View your latest scheduled medical visits
              </p>
            </CardHeader>
            <CardContent className='space-y-3'>
              {(stats?.recentAppointments || []).map((appointment: any) => (
                <AppointmentCardComponent
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
              {(stats?.recentAppointments || []).length === 0 && (
                <div className='text-muted-foreground py-8 text-center'>
                  No recent appointments found
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  )
}
export default Dashboard
