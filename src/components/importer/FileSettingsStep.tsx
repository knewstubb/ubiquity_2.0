import { useState } from 'react';
import { cn } from '../../lib/utils';
import { SegmentedControl } from '@/components/composed/segmented-control';
import type { ImporterConfig, PathMode, ImportDataType } from '../../models/importer';

interface FileSettingsStepProps {
  config: ImporterConfig;
  basePath: string;
  connectionName: string;
  onUpdate: (patch: Partial<ImporterConfig>) => void;
}

const PATH_MODES: { value: PathMode; label: string }[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'base', label: 'Shared' },
  { value: 'custom', label: 'Custom' },
];

const DATA_TYPES: { value: ImportDataType; label: string }[] = [
  { value: 'contact', label: 'Contacts' },
  { value: 'transactional', label: 'Transactional' },
  { value: 'both', label: 'Combined' },
];

/* ── Reusable Help Popover ── */
interface HelpPopoverProps {
  title: string;
  body: string;
}

function HelpPopover({ title, body }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] font-bold border-none cursor-pointer inline-flex items-center justify-center p-0 shrink-0 leading-none hover:bg-accent-hover"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Help: ${title}`}
      >
        ?
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[100] w-80 bg-accent-foreground text-primary-foreground rounded-md p-4 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.12),0px_4px_16px_0px_rgba(0,0,0,0.1),0px_8px_32px_0px_rgba(0,0,0,0.08)]" role="tooltip">
          <div className="flex items-center justify-between mb-2">
            <p className="text-base font-semibold m-0">{title}</p>
            <button
              type="button"
              className="bg-transparent border-none text-primary-foreground cursor-pointer text-base p-0 leading-none flex items-center justify-center hover:opacity-80"
              onClick={() => setOpen(false)}
              aria-label="Close help"
            >
              ✕
            </button>
          </div>
          <p className="text-[13px] font-normal leading-[18px] m-0">{body}</p>
        </div>
      )}
    </span>
  );
}

export function FileSettingsStep({
  config,
  basePath,
  connectionName,
  onUpdate,
}: FileSettingsStepProps) {
  const [patternError, setPatternError] = useState('');
  const { filePathConfig, dataType } = config;
  const { pathMode, folderName, readPath, errorFolderPath, archiveFolderPath, fileNamePattern } =
    filePathConfig;

  function updatePath(patch: Partial<typeof filePathConfig>) {
    onUpdate({ filePathConfig: { ...filePathConfig, ...patch } });
  }

  function validateFilePattern(value: string) {
    if (!value.includes('*')) {
      setPatternError('');
      return;
    }
    const beforeWildcard = value.split('*')[0];
    if (beforeWildcard.length === 0) {
      setPatternError('A filename must be included when using a wildcard');
    } else {
      setPatternError('');
    }
  }

  const effectiveBasePath =
    !basePath || basePath === '/' ? '/company/base-path/' : basePath;

  return (
    <div className="flex flex-col gap-8">
      <h3 className="m-0 text-lg font-semibold text-primary">File Settings</h3>
      <p className="mt-[-20px] mb-0 text-sm text-tertiary-foreground">Configure how files are read and where they are stored.</p>

      {/* Destination File Path */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">File Path</p>
            <HelpPopover
              title="How do files move through the system?"
              body="UbiQuity checks your Base Path every 5 minutes for files matching your File Pattern. When a file is found: it's moved to the Read Path while being processed, if the import succeeds it's moved to the Archive Path, if it fails it's moved to the Error Path."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">This must be unique</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <SegmentedControl
            options={PATH_MODES}
            value={pathMode}
            onValueChange={(v) => updatePath({ pathMode: v as PathMode })}
          />

          {pathMode === 'automatic' && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Folder Name</p>
                <input
                  className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)] placeholder:text-tertiary-foreground"
                  type="text"
                  value={folderName}
                  onChange={(e) => updatePath({ folderName: e.target.value })}
                  placeholder="e.g. onboarding-2026"
                  title="Must be unique. Lowercase letters and hyphens only."
                />
              </div>
              <div className="bg-accent border border-primary rounded-lg py-3 px-4 flex flex-col gap-1">
                <p className="text-xs font-semibold text-primary m-0 mb-1">Folders that will be created</p>
                <p className="text-xs text-primary font-normal m-0 leading-relaxed">{`${effectiveBasePath}${folderName || 'your-folder'}/`}</p>
                <p className="text-xs text-primary font-normal m-0 leading-relaxed">{`${effectiveBasePath}${folderName || 'your-folder'}/error/`}</p>
                <p className="text-xs text-primary font-normal m-0 leading-relaxed">{`${effectiveBasePath}${folderName || 'your-folder'}/archive/`}</p>
              </div>
            </>
          )}

          {pathMode === 'base' && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Read Path</p>
                <input
                  className="w-full py-2 px-3 text-sm border border-border rounded-md bg-secondary text-tertiary-foreground outline-none cursor-not-allowed"
                  type="text"
                  value={effectiveBasePath}
                  disabled
                  aria-label="Read path (inherited from connection)"
                />
              </div>
            </>
          )}

          {pathMode === 'custom' && (
            <>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Read Path</p>
                <input
                  className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)] placeholder:text-tertiary-foreground"
                  type="text"
                  value={readPath}
                  onChange={(e) => updatePath({ readPath: e.target.value })}
                  placeholder="/custom/inbound/"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Error Folder Path</p>
                <input
                  className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)] placeholder:text-tertiary-foreground"
                  type="text"
                  value={errorFolderPath}
                  onChange={(e) => updatePath({ errorFolderPath: e.target.value })}
                  placeholder="/custom/inbound/error/"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground m-0">Archive Folder Path</p>
                <input
                  className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none transition-colors duration-150 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)] placeholder:text-tertiary-foreground"
                  type="text"
                  value={archiveFolderPath}
                  onChange={(e) => updatePath({ archiveFolderPath: e.target.value })}
                  placeholder="/custom/inbound/archive/"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sample File */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Sample File</p>
            <HelpPopover
              title="Why does the sample file matter?"
              body="Your sample file defines the permanent column structure for this importer. Every production file you import later must match this exact format — same columns, same order. The file must be a CSV and under 50MB."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">
            This file will define all the fields available for mapping
          </p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <div className="border-2 border-dashed border-border rounded-md py-2 px-4 flex flex-row items-center gap-2 cursor-pointer h-10 transition-colors duration-150 hover:border-primary hover:bg-accent" role="button" tabIndex={0} aria-label="Upload sample file">
            <div className="text-tertiary-foreground flex items-center">
              <UploadIcon />
            </div>
            <p className="text-sm text-tertiary-foreground m-0 whitespace-nowrap">
              Drag & drop a file here, or{' '}
              <span className="text-primary font-medium underline cursor-pointer">browse</span>
            </p>
          </div>
        </div>
      </div>

      {/* File Pattern — only for base and custom modes */}
      {pathMode !== 'automatic' && (
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">File Pattern</p>
            <HelpPopover
              title="How does UbiQuity know which files to import?"
              body="UbiQuity looks for files whose name matches the pattern you set here. Use * to match any characters. For example: sales-*.csv matches sales-jan.csv, *.csv matches any CSV file."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">This must be unique</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <input
            className={cn(
              "w-full py-2 px-3 text-sm border rounded-md bg-background text-foreground outline-none transition-colors duration-150 placeholder:text-tertiary-foreground",
              patternError
                ? "border-destructive focus:border-destructive focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]"
                : "border-border focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]"
            )}
            type="text"
            value={fileNamePattern}
            onChange={(e) => updatePath({ fileNamePattern: e.target.value })}
            onBlur={(e) => validateFilePattern(e.target.value)}
            placeholder="filename*.csv"
            title="Which filenames to look for. Use * to match any characters."
          />
          {patternError && (
            <p className="text-xs text-destructive -mt-1 mb-0">{patternError}</p>
          )}
        </div>
      </div>
      )}

      {/* Importing To (Destination) */}
      <div className="flex items-start gap-14">
        <div className="w-40 shrink-0 pt-0 relative">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-foreground m-0">Importing To</p>
            <HelpPopover
              title="What's the difference?"
              body="Contacts updates the contact database for people records. Transactional updates a transactional table for activity data. Both updates contacts and transactional data in a single import."
            />
          </div>
          <p className="text-xs text-tertiary-foreground mt-1 mb-0">Select the database you want to update</p>
        </div>
        <div className="w-[552px] flex flex-col gap-3">
          <SegmentedControl
            options={DATA_TYPES}
            value={dataType ?? 'contact'}
            onValueChange={(v) => onUpdate({ dataType: v as ImportDataType })}
          />

          {/* Contacts Database — shown for contact and both */}
          {(dataType === 'contact' || dataType === 'both') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Contacts Database</p>
              <input
                className="w-full py-2 px-3 text-sm border border-border rounded-md bg-secondary text-tertiary-foreground outline-none cursor-not-allowed"
                type="text"
                value="Customer Contacts"
                disabled
              />
            </div>
          )}

          {/* Transactional Database — shown for transactional and both */}
          {(dataType === 'transactional' || dataType === 'both') && (
            <div>
              <p className="text-xs font-medium text-muted-foreground m-0">Transactional Database</p>
              <select
                className="w-full py-2 px-3 text-sm border border-border rounded-md bg-background text-foreground outline-none cursor-pointer transition-colors duration-150 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2712%27%20height%3D%278%27%20viewBox%3D%270%200%2012%208%27%20fill%3D%27none%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M1%201.5L6%206.5L11%201.5%27%20stroke%3D%27%23737373%27%20stroke-width%3D%272%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] pr-8 focus:border-primary focus:shadow-[0_0_0_2px_rgba(20,184,138,0.15)]"
                defaultValue=""
                aria-label="Select transactional table"
                title="The table where imported records will be stored."
              >
                <option value="" disabled>Select Database</option>
                <option value="treatments">Treatments</option>
                <option value="products">Products</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V4M8 8l4-4 4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
