import { useState } from 'react'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface StatusUpdateModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (status: string) => Promise<void>
    currentStatus: string
    isLoading?: boolean
}

const statusOptions = [
    {
        value: 'PENDING',
        label: 'Pending',
        icon: Clock,
        active: 'border-yellow-500 bg-yellow-50',
        iconColor: 'text-yellow-500',
    },
    {
        value: 'SCHEDULED',
        label: 'Approve',
        icon: CheckCircle2,
        active: 'border-blue-500 bg-blue-50',
        iconColor: 'text-blue-500',
    },
    {
        value: 'COMPLETED',
        label: 'Completed',
        icon: CheckCircle2,
        active: 'border-green-500 bg-green-50',
        iconColor: 'text-green-500',
    },
    {
        value: 'REJECTED',
        label: 'Reject',
        icon: XCircle,
        active: 'border-red-500 bg-red-50',
        iconColor: 'text-red-500',
    },
    {
        value: 'CANCELLED',
        label: 'Cancel',
        icon: XCircle,
        active: 'border-red-500 bg-red-50',
        iconColor: 'text-red-500',
    },
]

export function StatusUpdateModal({
    isOpen,
    onClose,
    onConfirm,
    currentStatus,
    isLoading,
}: StatusUpdateModalProps) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus)

    const handleConfirm = async () => {
        await onConfirm(selectedStatus)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[560px] rounded-2xl p-6">
                <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-semibold">
                        Update Appointment Status
                    </DialogTitle>
                    <DialogDescription>
                        Select the new status for this appointment.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    {statusOptions.map((option) => {
                        const isSelected = selectedStatus === option.value

                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setSelectedStatus(option.value)}
                                className={cn(
                                    'flex w-full items-center cursor-pointer gap-4 rounded-xl border p-4 text-left transition-all',
                                    'hover:bg-slate-50',
                                    isSelected
                                        ? option.active
                                        : 'border-slate-200'
                                )}
                            >
                                <option.icon
                                    className={cn('h-5 w-5', option.iconColor)}
                                />
                                <span className="text-sm font-medium">
                                    {option.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <DialogFooter className="mt-8 flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Updating...' : 'Update Status'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
