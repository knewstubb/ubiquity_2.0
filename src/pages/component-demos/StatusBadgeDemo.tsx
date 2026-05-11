import { StatusBadge } from '@/components/composed/status-badge'

export default function StatusBadgeDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <StatusBadge variant="active">Active</StatusBadge>
        <StatusBadge variant="invited">Invited</StatusBadge>
        <StatusBadge variant="inactive">Inactive</StatusBadge>
        <StatusBadge variant="error">Error</StatusBadge>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm w-32">Account status:</span>
          <StatusBadge variant="active">Active</StatusBadge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm w-32">User status:</span>
          <StatusBadge variant="invited">Pending Invite</StatusBadge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm w-32">Integration:</span>
          <StatusBadge variant="error">Disconnected</StatusBadge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm w-32">Campaign:</span>
          <StatusBadge variant="inactive">Paused</StatusBadge>
        </div>
      </div>
    </div>
  )
}
