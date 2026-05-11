import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SelectDemo() {
  return (
    <div className="flex flex-col gap-6 max-w-xs">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a segment" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Active Segments</SelectLabel>
            <SelectItem value="gold">Gold Members</SelectItem>
            <SelectItem value="silver">Silver Members</SelectItem>
            <SelectItem value="new">New Subscribers</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Archived</SelectLabel>
            <SelectItem value="inactive">Inactive Users</SelectItem>
            <SelectItem value="churned">Churned Customers</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Disabled select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
