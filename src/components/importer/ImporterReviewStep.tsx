export function ImporterReviewStep() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="m-0 text-lg font-semibold text-primary">Review</h3>
      <p className="mt-[-16px] mb-0 text-sm text-tertiary-foreground">Review your automation configuration before saving.</p>

      {/* File Settings */}
      <div className="bg-secondary rounded-lg px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground m-0">File Settings</h4>
          <button type="button" className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer p-0 hover:underline hover:text-accent-foreground">Edit</button>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Path Mode</span>
          <span className="text-sm text-foreground font-medium">Automatic</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Folder Name</span>
          <span className="text-sm text-foreground font-medium">onboarding-2026</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Sample File</span>
          <span className="text-sm text-foreground font-medium">sample-contacts.csv</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Importing To</span>
          <span className="text-sm text-foreground font-medium">Contacts</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Database</span>
          <span className="text-sm text-foreground font-medium">Customer Contacts</span>
        </div>
      </div>

      {/* Contact Configuration */}
      <div className="bg-secondary rounded-lg px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground m-0">Contact Configuration</h4>
          <button type="button" className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer p-0 hover:underline hover:text-accent-foreground">Edit</button>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Update Type</span>
          <span className="text-sm text-foreground font-medium">Append / Update</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Blank Values</span>
          <span className="text-sm text-foreground font-medium">Preserve Existing Data</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Matching Fields</span>
          <span className="text-sm text-foreground font-medium">Email, Customer ID</span>
        </div>
      </div>

      {/* Contact Mapping */}
      <div className="bg-secondary rounded-lg px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground m-0">Contact Mapping</h4>
          <button type="button" className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer p-0 hover:underline hover:text-accent-foreground">Edit</button>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-xs text-muted-foreground min-w-[120px]">policy_number</span>
            <span className="text-xs text-tertiary-foreground">→</span>
            <span className="text-xs text-accent-hover font-medium">policy_id</span>
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-xs text-muted-foreground min-w-[120px]">first_name</span>
            <span className="text-xs text-tertiary-foreground">→</span>
            <span className="text-xs text-accent-hover font-medium">first_name</span>
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-xs text-muted-foreground min-w-[120px]">last_name</span>
            <span className="text-xs text-tertiary-foreground">→</span>
            <span className="text-xs text-accent-hover font-medium">last_name</span>
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-xs text-muted-foreground min-w-[120px]">salutation</span>
            <span className="text-xs text-tertiary-foreground">→</span>
            <span className="text-xs text-accent-hover font-medium">greeting</span>
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-xs text-muted-foreground min-w-[120px]">email_address</span>
            <span className="text-xs text-tertiary-foreground">→</span>
            <span className="text-xs text-accent-hover font-medium">email_address</span>
          </div>
        </div>
        <p className="mt-2 mb-0 text-xs text-tertiary-foreground">5 of 9 fields mapped · 1 ignored · 1 warning</p>
      </div>

      {/* Notifications */}
      <div className="bg-secondary rounded-lg px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-foreground m-0">Notifications</h4>
          <button type="button" className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer p-0 hover:underline hover:text-accent-foreground">Edit</button>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Failure</span>
          <span className="text-sm text-foreground font-medium">contact@gmail.com</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">Success</span>
          <span className="text-sm text-foreground font-medium">Disabled</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-sm text-tertiary-foreground">No File Alert</span>
          <span className="text-sm text-foreground font-medium">Disabled</span>
        </div>
      </div>
    </div>
  );
}
