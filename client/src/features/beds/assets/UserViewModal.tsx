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

interface BedData {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  created_at: string
  updated_at: string
  roles?: Role[]
}

interface BedViewModalProps {
  open: boolean
  onClose: () => void
  bed: BedData
}

export function BedViewModal({ open, onClose, bed }: BedViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Bed Details</DialogTitle>
          <DialogDescription>
            <div className='space-y-2'>
              <div>
                <span className='font-semibold'>Name: </span>
                {bed.name}
              </div>
              <div>
                <span className='font-semibold'>Email: </span>
                {bed.email}
              </div>
              <div>
                <span className='font-semibold'>Email Verified: </span>
                {bed.email_verified_at ? (
                  <span className='text-green-600'>Yes</span>
                ) : (
                  <span className='text-red-600'>No</span>
                )}
              </div>
              <div>
                <span className='font-semibold'>Created At: </span>
                {new Date(bed.created_at).toLocaleString()}
              </div>
              <div>
                <span className='font-semibold'>Updated At: </span>
                {new Date(bed.updated_at).toLocaleString()}
              </div>
              <div>
                <span className='font-semibold'>Roles:</span>
                <div className='mt-1 flex flex-wrap gap-1'>
                  {bed.roles && bed.roles.length > 0 ? (
                    bed.roles.map((role) => (
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
