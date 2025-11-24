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

interface BillData {
  id: number
  name: string
  email: string
  email_verified_at?: string | null
  created_at: string
  updated_at: string
  roles?: Role[]
}

interface BillViewModalProps {
  open: boolean
  onClose: () => void
  bill: BillData
}

export function BillViewModal({ open, onClose, bill }: BillViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Bill Details</DialogTitle>
          <DialogDescription>
            <div className='space-y-2'>
              <div>
                <span className='font-semibold'>Name: </span>
                {bill.name}
              </div>
              <div>
                <span className='font-semibold'>Email: </span>
                {bill.email}
              </div>
              <div>
                <span className='font-semibold'>Email Verified: </span>
                {bill.email_verified_at ? (
                  <span className='text-green-600'>Yes</span>
                ) : (
                  <span className='text-red-600'>No</span>
                )}
              </div>
              <div>
                <span className='font-semibold'>Created At: </span>
                {new Date(bill.created_at).toLocaleString()}
              </div>
              <div>
                <span className='font-semibold'>Updated At: </span>
                {new Date(bill.updated_at).toLocaleString()}
              </div>
              <div>
                <span className='font-semibold'>Roles:</span>
                <div className='mt-1 flex flex-wrap gap-1'>
                  {bill.roles && bill.roles.length > 0 ? (
                    bill.roles.map((role) => (
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
