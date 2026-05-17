export function ImporterReviewStep() {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="m-0 text-xl font-semibold text-primary">Review</h3>
      <p className="-mt-6 mb-2 text-sm text-tertiary-foreground">Review your automation configuration before saving.</p>

      {/* File Settings */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">File Settings</h4>
          <button type="button" className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer p-0 hover:underline">Edit</button>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Path Mode</span>
            <span className="text-sm text-foreground font-medium">Automatic</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Folder Name</span>
            <span className="text-sm text-foreground font-medium">onboarding-2026</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Sample File</span>
            <span className="text-sm text-foreground font-medium">sample-contacts.csv</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Importing To</span>
            <span className="text-sm text-foreground font-medium">Contacts</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Database</span>
            <span className="text-sm text-foreground font-medium">Customer Contacts</span>
          </div>
        </div>
      </div>

      {/* Contact Configuration */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Contact Configuration</h4>
          <button type="button" className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer p-0 hover:underline">Edit</button>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Update Type</span>
            <span className="text-sm text-foreground font-medium">Append / Update</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Blank Values</span>
            <span className="text-sm text-foreground font-medium">Preserve Existing Data</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Matching Fields</span>
            <span className="text-sm text-foreground font-medium">Email, Customer ID</span>
          </div>
        </div>
      </div>

      {/* Contact Mapping */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Contact Mapping</h4>
          <button type="button" className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer p-0 hover:underline">Edit</button>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-sm text-muted-foreground min-w-[120px]">policy_number</span>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm text-primary font-medium">policy_id</span>
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-sm text-muted-foreground min-w-[120px]">first_name</span>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm text-primary font-medium">first_name</span>
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-sm text-muted-foreground min-w-[120px]">last_name</span>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm text-primary font-medium">last_name</span>
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-sm text-muted-foreground min-w-[120px]">salutation</span>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm text-primary font-medium">greeting</span>
          </div>
          <div className="flex items-center gap-2 py-0.5">
            <span className="text-sm text-muted-foreground min-w-[120px]">email_address</span>
            <span className="text-sm text-muted-foreground">→</span>
            <span className="text-sm text-primary font-medium">email_address</span>
          </div>
        </div>
        <p className="mt-2 mb-0 text-xs text-muted-foreground">5 of 9 fields mapped · 1 ignored · 1 warning</p>
      </div>

      {/* Notifications */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Notifications</h4>
          <button type="button" className="text-xs font-medium text-primary bg-transparent border-none cursor-pointer p-0 hover:underline">Edit</button>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Failure</span>
            <span className="text-sm text-foreground font-medium">contact@gmail.com</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">Success</span>
            <span className="text-sm text-foreground font-medium">Disabled</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-sm text-muted-foreground">No File Alert</span>
            <span className="text-sm text-foreground font-medium">Disabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
