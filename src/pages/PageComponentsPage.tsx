import { useState } from 'react';
import { DownloadSimple, UploadSimple, DotsThree, UsersThree, NewspaperClipping } from '@phosphor-icons/react';
import { Toggle } from '../components/shared/Toggle';

export default function PageComponentsPage() {
  const [toggleOn, setToggleOn] = useState(true);
  const [toggleOff, setToggleOff] = useState(false);

  return (
    <div className="max-w-[1000px] mx-auto p-10">
      <h1 className="text-2xl font-bold text-foreground mb-2">Page Components</h1>
      <p className="text-base text-muted-foreground mb-12">
        Breakdown of composed page-level components showing structure, tokens, and spacing.
      </p>

      {/* Connectors Page */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-foreground mb-6 pb-2 border-b border-border">Connectors List Page</h2>

        {/* Connection Card */}
        <div className="mb-8 border border-border rounded-lg overflow-hidden">
          <div className="flex items-baseline gap-3 px-4 py-3 bg-secondary border-b border-border">
            <h3 className="text-base font-semibold text-foreground m-0">ConnectionRow</h3>
            <span className="text-sm font-mono text-tertiary-foreground">src/components/dashboard/ConnectionRow.tsx</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5">
            <TokenRow token="border" value="1px solid --color-border-default" />
            <TokenRow token="border-radius" value="--radius-lg (8px)" />
            <TokenRow token="padding" value="--space-md (16px)" />
            <TokenRow token="margin-bottom" value="--space-lg (24px)" />
            <TokenRow token="title font" value="--font-size-lg / --font-weight-semibold" />
            <TokenRow token="title color" value="--color-accent-text" />
            <TokenRow token="title color (error)" value="--color-danger-text" />
            <TokenRow token="protocol label" value="--font-size-base / --font-weight-normal / --color-text-secondary" />
            <TokenRow token="count text" value="--font-size-base / --font-weight-semibold / --color-text-tertiary" />
            <TokenRow token="children gap" value="--space-ms (12px)" />
            <TokenRow token="title→children gap" value="--space-md (16px)" />
          </div>
          <div className="px-4 py-6 border-t border-border bg-background">
            <div className="border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-tertiary-foreground text-lg rotate-90">›</span>
                <span className="text-base text-muted-foreground">SFTP:</span>
                <span className="text-lg font-semibold text-accent-foreground">Primary Database</span>
                <span className="text-base font-semibold text-tertiary-foreground ml-auto">3 of 4 Automations Active</span>
                <span className="text-tertiary-foreground cursor-pointer"><DotsThree size={20} weight="bold" /></span>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-md bg-background">
                  <span className="text-primary flex"><DownloadSimple size={18} /></span>
                  <span className="text-sm font-semibold text-foreground">daily_sales_report</span>
                  <span className="text-base text-muted-foreground">Importer</span>
                  <span className="flex items-center gap-1.5 text-base text-muted-foreground"><NewspaperClipping size={14} /> treatments</span>
                  <span className="text-[10px] font-semibold px-1.5 rounded-full bg-[rgba(20,184,138,0.15)] text-accent-foreground leading-4">Completed</span>
                  <span className="text-xs text-tertiary-foreground ml-auto">2-minutes ago</span>
                  <Toggle checked={toggleOn} onChange={setToggleOn} label="Active" />
                  <span className="text-tertiary-foreground cursor-pointer"><DotsThree size={16} weight="bold" /></span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 border border-border rounded-md bg-background">
                  <span className="text-primary flex"><UploadSimple size={18} /></span>
                  <span className="text-sm font-semibold text-foreground">at_risk_customers</span>
                  <span className="text-base text-muted-foreground">Exporter</span>
                  <span className="flex items-center gap-1.5 text-base text-muted-foreground"><UsersThree size={14} /> contacts</span>
                  <span className="text-[10px] font-semibold px-1.5 rounded-full bg-[rgba(20,184,138,0.15)] text-accent-foreground leading-4">Completed</span>
                  <span className="text-xs text-tertiary-foreground ml-auto">12-days ago</span>
                  <Toggle checked={toggleOff} onChange={setToggleOff} label="Paused" />
                  <span className="text-tertiary-foreground cursor-pointer"><DotsThree size={16} weight="bold" /></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Card */}
        <div className="mb-8 border border-border rounded-lg overflow-hidden">
          <div className="flex items-baseline gap-3 px-4 py-3 bg-secondary border-b border-border">
            <h3 className="text-base font-semibold text-foreground m-0">AutomationCard</h3>
            <span className="text-sm font-mono text-tertiary-foreground">src/components/dashboard/AutomationCard.tsx</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5">
            <TokenRow token="layout" value="grid: 1fr 1fr 1fr auto" />
            <TokenRow token="padding" value="--space-sm (8px) top/bottom, 16px left/right" />
            <TokenRow token="min-height" value="44px" />
            <TokenRow token="background" value="--color-background-default" />
            <TokenRow token="border" value="1px solid --color-border-default" />
            <TokenRow token="border-radius" value="--radius-md (6px)" />
            <TokenRow token="border (hover)" value="--color-accent-default" />
            <TokenRow token="shadow (hover)" value="--shadow-m" />
            <TokenRow token="name font" value="14px / 600 / --color-text-primary" />
            <TokenRow token="data type" value="--font-size-base / --color-text-secondary" />
            <TokenRow token="badge (completed)" value="rgba(20,184,138,0.15) bg / --color-accent-text" />
            <TokenRow token="badge (failed)" value="rgba(239,68,68,0.15) bg / --color-danger-text" />
            <TokenRow token="time" value="12px / --color-text-tertiary" />
          </div>
        </div>

        {/* Add Automation Card */}
        <div className="mb-8 border border-border rounded-lg overflow-hidden">
          <div className="flex items-baseline gap-3 px-4 py-3 bg-secondary border-b border-border">
            <h3 className="text-base font-semibold text-foreground m-0">Add Automation Card</h3>
            <span className="text-sm font-mono text-tertiary-foreground">src/pages/DashboardPage.module.css (.addAutomationCard)</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5">
            <TokenRow token="height" value="44px" />
            <TokenRow token="border" value="1px dashed --color-border-strong" />
            <TokenRow token="border (hover)" value="--color-accent-default" />
            <TokenRow token="border-radius" value="8px" />
            <TokenRow token="text" value="14px / 600 / --color-accent-default" />
            <TokenRow token="background (hover)" value="rgba(20,184,138,0.04)" />
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 border border-border rounded-lg overflow-hidden">
          <div className="flex items-baseline gap-3 px-4 py-3 bg-secondary border-b border-border">
            <h3 className="text-base font-semibold text-foreground m-0">Page Header</h3>
            <span className="text-sm font-mono text-tertiary-foreground">src/pages/DashboardPage.module.css (.header, .title)</span>
          </div>
          <div className="px-4 py-3 flex flex-col gap-1.5">
            <TokenRow token="title font" value="--font-size-2xl (24px) / --font-weight-semibold" />
            <TokenRow token="title color" value="--color-text-primary" />
            <TokenRow token="subtitle" value="--font-size-sm / --color-text-tertiary" />
            <TokenRow token="header margin-bottom" value="--space-7 (32px)" />
            <TokenRow token="page padding" value="--space-7 (32px) --space-6 (24px)" />
            <TokenRow token="New Connection button" value="Button variant=solid size=compact + Plus icon" />
          </div>
        </div>
      </section>
    </div>
  );
}

function TokenRow({ token, value }: { token: string; value: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 items-baseline py-1 border-b border-secondary last:border-b-0">
      <span className="text-sm font-medium text-muted-foreground">{token}</span>
      <span className="text-sm font-mono text-foreground">{value}</span>
    </div>
  );
}
