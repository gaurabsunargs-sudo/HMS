import React from 'react'
import {
  Calendar,
  User,
  FileText,
  Pill,
  Bed,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Heart,
  Stethoscope,
  Building,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useProfile } from '@/api/hooks/useAuth'
import { useBreadcrumb } from '@/hooks/useBreadCrumb'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileUpload } from '@/components/profile-upload'

const Profile = () => {
  useBreadcrumb([{ link: '/profile', title: 'My Profile' }])
  const { data: profileData, isLoading } = useProfile()

  // Type the profile data properly
  const profile = profileData?.data as any
  const user = profile?.user
  const role = user?.role || 'PATIENT'
  const summary = profile?.summary

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <AlertCircle className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
          <h3 className='text-lg font-semibold'>Profile not found</h3>
          <p className='text-muted-foreground'>Unable to load profile data</p>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      SCHEDULED: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock,
      },
      COMPLETED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
      },
      ADMITTED: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Bed,
      },
      DISCHARGED: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      },
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
      },
      PAID: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      },
    }

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const Icon = config.icon

    return (
      <Badge variant='outline' className={config.color}>
        <Icon className='mr-1 h-3 w-3' />
        {status}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  console.log(profile)
  return (
    <div className='space-y-6'>
      {/* Header with improved styling */}
      <div className='flex flex-col space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>
          {getGreeting()},{' '}
          <span className='text-primary'>
            {user?.firstName} {user?.lastName}
          </span>
        </h1>
        <p className='text-muted-foreground'>
          Welcome to your {role.toLowerCase()} profile dashboard
        </p>
      </div>

      {/* Main content with tabs */}
      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3 lg:w-1/3'>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='details'>Details</TabsTrigger>
          <TabsTrigger value='activity'>Activity</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          {/* User Info Card with improved layout */}
          <div className='grid gap-6 md:grid-cols-3'>
            <Card className='md:col-span-1'>
              <CardContent className='pt-6'>
                <div className='flex flex-col items-center space-y-4'>
                  <ProfileUpload
                    currentProfile={profile?.profile}
                    userName={`${profile?.firstName} ${profile?.lastName}`}
                  />
                  <div className='text-center'>
                    <h2 className='text-xl font-semibold'>
                      {profile?.firstName} {profile?.lastName}
                    </h2>
                    <p className='text-muted-foreground capitalize'>
                      {role.toLowerCase()}
                    </p>
                    <Badge
                      variant={profile?.isActive ? 'default' : 'secondary'}
                      className='mt-2 capitalize'
                    >
                      {profile?.isActive ? 'Active' : 'Inactive'} •{' '}
                      {profile?.isCurrentlyOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
                <Separator className='my-4' />
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm'>{profile?.email}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm'>{profile?.username}</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Clock className='text-muted-foreground h-4 w-4' />
                    <span className='text-sm'>
                      Member since {formatDate(profile?.createdAt || '')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Statistics with improved visuals */}
            <Card className='md:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Activity className='h-5 w-5' />
                  Summary Statistics
                </CardTitle>
                <CardDescription>
                  Your overall activity and records summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                    {role === 'PATIENT' && (
                      <>
                        <StatCard
                          title='Appointments'
                          value={summary.totalAppointments}
                          icon={<Calendar className='h-4 w-4' />}
                          color='text-blue-600'
                          description='Total scheduled appointments'
                        />
                        <StatCard
                          title='Admissions'
                          value={summary.totalAdmissions}
                          icon={<Bed className='h-4 w-4' />}
                          color='text-indigo-600'
                          description='Total hospital admissions'
                        />
                        <StatCard
                          title='Medical Records'
                          value={summary.totalMedicalRecords}
                          icon={<FileText className='h-4 w-4' />}
                          color='text-green-600'
                          description='Your medical history records'
                        />
                        <StatCard
                          title='Prescriptions'
                          value={summary.totalPrescriptions}
                          icon={<Pill className='h-4 w-4' />}
                          color='text-purple-600'
                          description='Prescribed medications received'
                        />
                        <StatCard
                          title='Total Bills'
                          value={summary.totalBills}
                          icon={<DollarSign className='h-4 w-4' />}
                          color='text-amber-600'
                          description='All bills generated for you'
                        />
                        <StatCard
                          title='Pending Bills'
                          value={summary.pendingBills}
                          icon={<AlertCircle className='h-4 w-4' />}
                          color='text-red-600'
                          description='Bills awaiting your payment'
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <div className='flex h-40 items-center justify-center'>
                    <p className='text-muted-foreground'>
                      No summary data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          {role === 'PATIENT' && summary && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your most recent interactions and records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid gap-6 md:grid-cols-2'>
                  {/* Recent Appointments */}
                  {summary.recentAppointments &&
                    summary.recentAppointments.length > 0 && (
                      <div>
                        <h3 className='mb-3 flex items-center gap-2 font-semibold'>
                          <Calendar className='h-4 w-4' />
                          Recent Appointments
                        </h3>
                        <div className='space-y-3'>
                          {summary.recentAppointments
                            .slice(0, 3)
                            .map((appointment: any) => (
                              <ActivityItem
                                key={appointment.id}
                                title={`Dr. ${appointment.doctor?.user?.firstName} ${appointment.doctor?.user?.lastName}`}
                                description={appointment.reason}
                                date={appointment.dateTime}
                                status={appointment.status}
                                getStatusBadge={getStatusBadge}
                                formatDateTime={formatDateTime}
                              />
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Recent Prescriptions */}
                  {summary.recentPrescriptions &&
                    summary.recentPrescriptions.length > 0 && (
                      <div>
                        <h3 className='mb-3 flex items-center gap-2 font-semibold'>
                          <Pill className='h-4 w-4' />
                          Recent Prescriptions
                        </h3>
                        <div className='space-y-3'>
                          {summary.recentPrescriptions
                            .slice(0, 3)
                            .map((prescription: any) => (
                              <ActivityItem
                                key={prescription.id}
                                title={`Dr. ${prescription.doctor?.user?.firstName} ${prescription.doctor?.user?.lastName}`}
                                description={prescription.instructions}
                                date={prescription.issuedDate}
                                status='ISSUED'
                                getStatusBadge={getStatusBadge}
                                formatDateTime={formatDate}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value='details' className='space-y-6'>
          {/* Role-specific Profile Details */}
          {role === 'PATIENT' && profile?.patient && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Heart className='h-5 w-5' />
                  Patient Information
                </CardTitle>
                <CardDescription>
                  Your personal and medical details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-4'>
                    <DetailItem
                      icon={<User className='h-4 w-4' />}
                      label='Patient ID'
                      value={profile?.username}
                    />
                    <DetailItem
                      icon={<Calendar className='h-4 w-4' />}
                      label='Date of Birth'
                      value={formatDate(profile.patient.dateOfBirth)}
                    />
                    <DetailItem
                      icon={<User className='h-4 w-4' />}
                      label='Gender'
                      value={profile.patient.gender}
                    />
                    <DetailItem
                      icon={<Heart className='h-4 w-4' />}
                      label='Blood Group'
                      value={profile.patient.bloodGroup}
                    />
                  </div>
                  <div className='space-y-4'>
                    <DetailItem
                      icon={<Phone className='h-4 w-4' />}
                      label='Contact Number'
                      value={profile.patient.contactNumber}
                    />
                    <DetailItem
                      icon={<Phone className='h-4 w-4' />}
                      label='Emergency Contact'
                      value={profile.patient.emergencyContact}
                    />
                    <DetailItem
                      icon={<MapPin className='h-4 w-4' />}
                      label='Address'
                      value={profile.patient.address}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {role === 'DOCTOR' && profile.doctor && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Stethoscope className='h-5 w-5' />
                  Doctor Information
                </CardTitle>
                <CardDescription>
                  Your professional and medical details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <div className='space-y-4'>
                    <DetailItem
                      icon={<User className='h-4 w-4' />}
                      label='License Number'
                      value={profile.doctor.licenseNumber}
                    />
                    <DetailItem
                      icon={<Stethoscope className='h-4 w-4' />}
                      label='Specialization'
                      value={profile.doctor.specialization}
                    />
                    <DetailItem
                      icon={<Clock className='h-4 w-4' />}
                      label='Experience'
                      value={`${profile.doctor.experience} years`}
                    />
                    <DetailItem
                      icon={<DollarSign className='h-4 w-4' />}
                      label='Consultation Fee'
                      value={`Rs ${profile.doctor.consultationFee}`}
                    />
                  </div>
                  <div className='space-y-4'>
                    <DetailItem
                      icon={<Activity className='h-4 w-4' />}
                      label='Availability'
                      value={
                        <Badge
                          variant={
                            profile.doctor.isAvailable ? 'default' : 'secondary'
                          }
                        >
                          {profile.doctor.isAvailable
                            ? 'Available'
                            : 'Unavailable'}
                        </Badge>
                      }
                    />
                    <DetailItem
                      icon={<FileText className='h-4 w-4' />}
                      label='Qualifications'
                      value={profile.doctor.qualifications.join(', ')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {role === 'ADMIN' && profile.adminProfile && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Building className='h-5 w-5' />
                  Admin Information
                </CardTitle>
                <CardDescription>Your administrative details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <DetailItem
                    icon={<User className='h-4 w-4' />}
                    label='Employee ID'
                    value={profile.adminProfile.employeeId}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Account Details - Show for all roles */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Account Information
              </CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <DetailItem
                    icon={<User className='h-4 w-4' />}
                    label='Full Name'
                    value={`${user?.firstName} ${user?.middleName ? user.middleName + ' ' : ''}${user?.lastName}`}
                  />
                  <DetailItem
                    icon={<Mail className='h-4 w-4' />}
                    label='Email Address'
                    value={user?.email}
                  />
                  <DetailItem
                    icon={<User className='h-4 w-4' />}
                    label='Username'
                    value={user?.username}
                  />
                </div>
                <div className='space-y-4'>
                  <DetailItem
                    icon={<Activity className='h-4 w-4' />}
                    label='Account Status'
                    value={
                      <Badge variant={user?.isActive ? 'default' : 'secondary'}>
                        {user?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    }
                  />
                  <DetailItem
                    icon={<Activity className='h-4 w-4' />}
                    label='Online Status'
                    value={
                      <Badge
                        variant={
                          user?.isCurrentlyOnline ? 'default' : 'secondary'
                        }
                      >
                        {user?.isCurrentlyOnline ? 'Online' : 'Offline'}
                      </Badge>
                    }
                  />
                  <DetailItem
                    icon={<Clock className='h-4 w-4' />}
                    label='Member Since'
                    value={formatDate(user?.createdAt || '')}
                  />
                  <DetailItem
                    icon={<Clock className='h-4 w-4' />}
                    label='Last Updated'
                    value={formatDate(user?.updatedAt || '')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='activity' className='space-y-6'>
          {/* Full Activity History */}
          {role === 'PATIENT' && summary && (
            <>
              {/* Recent Appointments */}
              {summary.recentAppointments &&
                summary.recentAppointments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Calendar className='h-5 w-5' />
                        Appointment History
                      </CardTitle>
                      <CardDescription>
                        Your complete appointment history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        {summary.recentAppointments.map((appointment: any) => (
                          <ActivityItem
                            key={appointment.id}
                            title={`Dr. ${appointment.doctor?.user?.firstName} ${appointment.doctor?.user?.lastName}`}
                            description={appointment.reason}
                            date={appointment.dateTime}
                            status={appointment.status}
                            getStatusBadge={getStatusBadge}
                            formatDateTime={formatDateTime}
                            fullWidth
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Recent Medical Records */}
              {summary.recentMedicalRecords &&
                summary.recentMedicalRecords.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        Medical Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        {summary.recentMedicalRecords.map((record: any) => (
                          <div
                            key={record.id}
                            className='rounded-lg border p-4'
                          >
                            <div className='mb-3 flex items-center justify-between'>
                              <h4 className='font-medium'>
                                Dr. {record.doctor?.user?.firstName}{' '}
                                {record.doctor?.user?.lastName}
                              </h4>
                              <span className='text-muted-foreground text-sm'>
                                {formatDate(record.createdAt)}
                              </span>
                            </div>
                            <div className='grid gap-2 text-sm md:grid-cols-2'>
                              <div>
                                <p className='font-medium'>Symptoms:</p>
                                <p className='text-muted-foreground'>
                                  {record.symptoms}
                                </p>
                              </div>
                              <div>
                                <p className='font-medium'>Diagnosis:</p>
                                <p className='text-muted-foreground'>
                                  {record.diagnosis}
                                </p>
                              </div>
                              {record.treatment && (
                                <div className='md:col-span-2'>
                                  <p className='font-medium'>Treatment:</p>
                                  <p className='text-muted-foreground'>
                                    {record.treatment}
                                  </p>
                                </div>
                              )}
                              {record.notes && (
                                <div className='md:col-span-2'>
                                  <p className='font-medium'>Notes:</p>
                                  <p className='text-muted-foreground'>
                                    {record.notes}
                                  </p>
                                </div>
                              )}
                              {record.attachments &&
                                record.attachments.length > 0 && (
                                  <div className='md:col-span-2'>
                                    <p className='font-medium'>Attachments:</p>
                                    <div className='mt-1 flex flex-wrap gap-2'>
                                      {record.attachments.map(
                                        (attachment: string, index: number) => (
                                          <Badge
                                            key={index}
                                            variant='outline'
                                            className='text-xs'
                                          >
                                            {attachment}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Recent Prescriptions */}
              {summary.recentPrescriptions &&
                summary.recentPrescriptions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Pill className='h-5 w-5' />
                        Prescription History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        {summary.recentPrescriptions.map(
                          (prescription: any) => (
                            <div
                              key={prescription.id}
                              className='rounded-lg border p-4'
                            >
                              <div className='mb-3 flex items-center justify-between'>
                                <h4 className='font-medium'>
                                  Dr. {prescription.doctor?.user?.firstName}{' '}
                                  {prescription.doctor?.user?.lastName}
                                </h4>
                                <div className='text-right'>
                                  <p className='text-sm font-medium'>
                                    Issued:{' '}
                                    {formatDate(prescription.issuedDate)}
                                  </p>
                                  <p className='text-muted-foreground text-sm'>
                                    Valid until:{' '}
                                    {formatDate(prescription.validUntil)}
                                  </p>
                                </div>
                              </div>
                              <p className='mb-3 text-sm'>
                                <span className='font-medium'>
                                  Instructions:
                                </span>{' '}
                                {prescription.instructions}
                              </p>
                              <div>
                                <p className='mb-2 text-sm font-medium'>
                                  Medicines:
                                </p>
                                <div className='space-y-2'>
                                  {prescription.medicines.map(
                                    (medicine: any) => (
                                      <div
                                        key={medicine.id}
                                        className='flex items-center justify-between border-b pb-2 text-sm'
                                      >
                                        <div>
                                          <p className='font-medium'>
                                            {medicine.name}
                                          </p>
                                          <p className='text-muted-foreground'>
                                            {medicine.dosage} -{' '}
                                            {medicine.frequency}
                                          </p>
                                        </div>
                                        <div className='text-right'>
                                          <p>Duration: {medicine.duration}</p>
                                          <p className='text-muted-foreground'>
                                            Quantity: {medicine.quantity}
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Recent Bills */}
              {summary.recentBills && summary.recentBills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <DollarSign className='h-5 w-5' />
                      Billing History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {summary.recentBills.map((bill: any) => (
                        <div key={bill.id} className='rounded-lg border p-4'>
                          <div className='mb-3 flex items-center justify-between'>
                            <div>
                              <p className='font-medium'>{bill.billNumber}</p>
                              <p className='text-muted-foreground text-sm'>
                                Due: {formatDate(bill.dueDate)}
                              </p>
                            </div>
                            <div className='text-right'>
                              <p className='font-medium'>
                                Rs {bill.totalAmount.toLocaleString()}
                              </p>
                              {getStatusBadge(bill.status)}
                            </div>
                          </div>

                          <div className='mb-3'>
                            <p className='mb-2 text-sm font-medium'>Items:</p>
                            <div className='space-y-1'>
                              {bill.billItems.map((item: any) => (
                                <div
                                  key={item.id}
                                  className='flex justify-between text-sm'
                                >
                                  <span>{item.description}</span>
                                  <span>
                                    Rs {item.totalPrice.toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {bill.payments && bill.payments.length > 0 && (
                            <div>
                              <p className='mb-2 text-sm font-medium'>
                                Payments:
                              </p>
                              <div className='space-y-2'>
                                {bill.payments.map((payment: any) => (
                                  <div
                                    key={payment.id}
                                    className='flex justify-between border-b pb-1 text-sm'
                                  >
                                    <div>
                                      <span className='font-medium'>
                                        Rs {payment.amount}
                                      </span>
                                      <span className='text-muted-foreground ml-2'>
                                        via {payment.paymentMethod}
                                      </span>
                                    </div>
                                    <span className='text-muted-foreground'>
                                      {formatDate(payment.paymentDate)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Admissions */}
              {summary.recentAdmissions &&
                summary.recentAdmissions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <Bed className='h-5 w-5' />
                        Admission History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        {summary.recentAdmissions.map((admission: any) => (
                          <div
                            key={admission.id}
                            className='rounded-lg border p-4'
                          >
                            <div className='mb-3 flex items-center justify-between'>
                              <div>
                                <p className='font-medium'>
                                  Bed {admission.bed.bedNumber} (
                                  {admission.bed.bedType})
                                </p>
                                <p className='text-muted-foreground text-sm'>
                                  {admission.bed.ward}
                                </p>
                              </div>
                              {getStatusBadge(admission.status)}
                            </div>

                            <div className='mb-3 grid grid-cols-2 gap-4 text-sm'>
                              <div>
                                <p className='font-medium'>Admission Date:</p>
                                <p className='text-muted-foreground'>
                                  {formatDateTime(admission.admissionDate)}
                                </p>
                              </div>
                              <div>
                                <p className='font-medium'>Discharge Date:</p>
                                <p className='text-muted-foreground'>
                                  {admission.dischargeDate
                                    ? formatDateTime(admission.dischargeDate)
                                    : 'Not discharged'}
                                </p>
                              </div>
                            </div>

                            <div className='mb-3'>
                              <p className='font-medium'>Reason:</p>
                              <p className='text-muted-foreground text-sm'>
                                {admission.reason}
                              </p>
                            </div>

                            <div className='flex items-center justify-between'>
                              <p className='font-medium'>
                                Total Amount: Rs {admission.totalAmount}
                              </p>
                              <p className='text-muted-foreground text-sm'>
                                {formatDate(admission.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper Components
const ProfileSkeleton = () => {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col space-y-2'>
        <Skeleton className='h-8 w-64' />
        <Skeleton className='h-4 w-80' />
      </div>
      <div className='grid gap-6 md:grid-cols-3'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center space-y-4'>
              <Skeleton className='h-24 w-24 rounded-full' />
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-4 w-32' />
              <div className='flex w-full flex-col space-y-2'>
                <Skeleton className='h-9 w-full' />
                <Skeleton className='h-9 w-full' />
              </div>
            </div>
            <Separator className='my-4' />
            <div className='space-y-3'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </div>
          </CardContent>
        </Card>
        <Card className='md:col-span-2'>
          <CardHeader>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-64' />
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className='h-24 rounded-lg' />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const StatCard = ({
  title,
  value,
  icon,
  color,
  description,
}: {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  description?: string
}) => {
  return (
    <div className='flex flex-col items-center justify-center rounded-lg border p-4 text-center'>
      <div className={`rounded-full p-2 ${color} bg-opacity-10`}>{icon}</div>
      <h3 className='mt-2 text-2xl font-bold'>{value}</h3>
      <p className='text-muted-foreground text-sm'>{title}</p>
      {description && (
        <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
          {description}
        </p>
      )}
    </div>
  )
}

const DetailItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
}) => {
  return (
    <div className='flex items-start gap-3'>
      <div className='text-muted-foreground mt-0.5'>{icon}</div>
      <div>
        <p className='font-medium'>{label}</p>
        <div className='text-muted-foreground'>{value}</div>
      </div>
    </div>
  )
}

const ActivityItem = ({
  title,
  description,
  date,
  status,
  getStatusBadge,
  formatDateTime,
  fullWidth = false,
}: {
  title: string
  description: string
  date: string
  status: string
  getStatusBadge: (status: string) => React.ReactNode
  formatDateTime: (date: string) => string
  fullWidth?: boolean
}) => {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-3 ${fullWidth ? 'w-full' : ''}`}
    >
      <div className='flex items-center gap-3'>
        <div className='bg-primary/10 rounded-full p-2'>
          <Calendar className='text-primary h-4 w-4' />
        </div>
        <div>
          <p className='font-medium'>{title}</p>
          <p className='text-muted-foreground line-clamp-1 text-sm'>
            {description}
          </p>
        </div>
      </div>
      <div className='text-right'>
        <p className='text-sm font-medium'>{formatDateTime(date)}</p>
        {getStatusBadge(status)}
      </div>
    </div>
  )
}

export default Profile
