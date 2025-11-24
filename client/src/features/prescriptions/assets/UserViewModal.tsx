import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface Role {
  id: number
  name: string
  guard_name: string
  created_at: string
  updated_at: string
  pivot?: any
}

interface PrescriptionData {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  created_at: string
  updated_at: string
  roles?: Role[]
}

interface PrescriptionViewModalProps {
  open: boolean
  onClose: () => void
  prescription: PrescriptionData
}

export function PrescriptionViewModal({
  open,
  onClose,
  prescription,
}: PrescriptionViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Prescription Details</DialogTitle>
          <DialogDescription>
            <div className='space-y-2'>
              <div>
                <span className='font-semibold'>Name: </span>
                {prescription.name}
              </div>
              <div>
                <span className='font-semibold'>Email: </span>
                {prescription.email}
              </div>
              <div>
                <span className='font-semibold'>Email Verified: </span>
                {prescription.email_verified_at ? (
                  <span className='text-green-600'>Yes</span>
                ) : (
                  <span className='text-red-600'>No</span>
                )}
              </div>
              <div>
                <span className='font-semibold'>Created At: </span>
                {new Date(prescription.created_at).toLocaleString()}
              </div>
              <div>
                <span className='font-semibold'>Updated At: </span>
                {new Date(prescription.updated_at).toLocaleString()}
              </div>
              <div>
                <span className='font-semibold'>Roles:</span>
                <div className='mt-1 flex flex-wrap gap-1'>
                  {prescription.roles && prescription.roles.length > 0 ? (
                    prescription.roles.map((role) => (
                      <Badge key={role.id} variant='secondary'>
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <span className='text-muted-foreground text-xs'>
                      No roles
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className='flex justify-end'>
          <Button variant='outline' onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
