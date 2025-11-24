import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot?: any;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

interface UserViewModalProps {
  open: boolean;
  onClose: () => void;
  user: UserData;
}

export function UserViewModal({ open, onClose, user }: UserViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            <div className="space-y-2">
              <div>
                <span className="font-semibold">Name: </span>
                {user.name}
              </div>
              <div>
                <span className="font-semibold">Email: </span>
                {user.email}
              </div>
              <div>
                <span className="font-semibold">Email Verified: </span>
                {user.email_verified_at ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-red-600">No</span>
                )}
              </div>
              <div>
                <span className="font-semibold">Created At: </span>
                {new Date(user.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Updated At: </span>
                {new Date(user.updated_at).toLocaleString()}
              </div>
              <div>
                <span className="font-semibold">Roles:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        {role.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-xs">
                      No roles
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
