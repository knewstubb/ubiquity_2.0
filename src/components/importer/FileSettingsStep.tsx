import { useState } from 'react';
import type { ImporterConfig, PathMode, ImportDataType } from '../../models/importer';
import styles from './FileSettingsStep.module.css';

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
    <span className={styles.popoverWrap}>
      <button
        type="button"
        className={styles.helpBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label={`Help: ${title}`}
      >
        ?
      </button>
      {open && (
        <div className={styles.popover} role="tooltip">
          <div className={styles.popoverTitleRow}>
            <p className={styles.popoverTitle}>{title}</p>
            <button
              type="button"
              className={styles.popoverClose}
              onClick={() => setOpen(false)}
              aria-label="Close help"
            >
              ✕
            </button>
          </div>
          <p className={styles.popoverBody}>{body}</p>
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
    <div className={styles.container}>
      <h3 className={styles.title}>File Settings</h3>
      <p className={styles.subtitle}>Configure how files are read and where they are stored.</p>

      {/* Destination File Path */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>File Path</p>
            <HelpPopover
              title="How do files move through the system?"
              body="UbiQuity checks your Base Path every 5 minutes for files matching your File Pattern. When a file is found: it's moved to the Read Path while being processed, if the import succeeds it's moved to the Archive Path, if it fails it's moved to the Error Path."
            />
          </div>
          <p className={styles.labelHint}>This must be unique</p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.segmented}>
            {PATH_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                className={`${styles.segmentBtn} ${pathMode === mode.value ? styles.segmentBtnActive : ''}`}
                onClick={() => updatePath({ pathMode: mode.value })}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {pathMode === 'automatic' && (
            <>
              <div>
                <p className={styles.inputLabel}>Folder Name</p>
                <input
                  className={styles.textInput}
                  type="text"
                  value={folderName}
                  onChange={(e) => updatePath({ folderName: e.target.value })}
                  placeholder="e.g. onboarding-2026"
                  title="Must be unique. Lowercase letters and hyphens only."
                />
              </div>
              <div className={styles.previewBox}>
                <p className={styles.previewHeader}>Folders that will be created</p>
                <p className={styles.previewPath}>{`${effectiveBasePath}${folderName || 'your-folder'}/`}</p>
                <p className={styles.previewPath}>{`${effectiveBasePath}${folderName || 'your-folder'}/error/`}</p>
                <p className={styles.previewPath}>{`${effectiveBasePath}${folderName || 'your-folder'}/archive/`}</p>
              </div>
            </>
          )}

          {pathMode === 'base' && (
            <>
              <div>
                <p className={styles.inputLabel}>Read Path</p>
                <input
                  className={styles.textInput}
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
                <p className={styles.inputLabel}>Read Path</p>
                <input
                  className={styles.textInput}
                  type="text"
                  value={readPath}
                  onChange={(e) => updatePath({ readPath: e.target.value })}
                  placeholder="/custom/inbound/"
                />
              </div>
              <div>
                <p className={styles.inputLabel}>Error Folder Path</p>
                <input
                  className={styles.textInput}
                  type="text"
                  value={errorFolderPath}
                  onChange={(e) => updatePath({ errorFolderPath: e.target.value })}
                  placeholder="/custom/inbound/error/"
                />
              </div>
              <div>
                <p className={styles.inputLabel}>Archive Folder Path</p>
                <input
                  className={styles.textInput}
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
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>Sample File</p>
            <HelpPopover
              title="Why does the sample file matter?"
              body="Your sample file defines the permanent column structure for this importer. Every production file you import later must match this exact format — same columns, same order. The file must be a CSV and under 50MB."
            />
          </div>
          <p className={styles.labelHint}>
            This file will define all the fields available for mapping
          </p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.dropzone} role="button" tabIndex={0} aria-label="Upload sample file">
            <div className={styles.dropzoneIcon}>
              <UploadIcon />
            </div>
            <p className={styles.dropzoneText}>
              Drag & drop a file here, or{' '}
              <span className={styles.dropzoneLink}>browse</span>
            </p>
          </div>
        </div>
      </div>

      {/* File Pattern — only for base and custom modes */}
      {pathMode !== 'automatic' && (
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>File Pattern</p>
            <HelpPopover
              title="How does UbiQuity know which files to import?"
              body="UbiQuity looks for files whose name matches the pattern you set here. Use * to match any characters. For example: sales-*.csv matches sales-jan.csv, *.csv matches any CSV file."
            />
          </div>
          <p className={styles.labelHint}>This must be unique</p>
        </div>
        <div className={styles.inputCol}>
          <input
            className={`${styles.textInput} ${patternError ? styles.textInputError : ''}`}
            type="text"
            value={fileNamePattern}
            onChange={(e) => updatePath({ fileNamePattern: e.target.value })}
            onBlur={(e) => validateFilePattern(e.target.value)}
            placeholder="filename*.csv"
            title="Which filenames to look for. Use * to match any characters."
          />
          {patternError && (
            <p className={styles.validationError}>{patternError}</p>
          )}
        </div>
      </div>
      )}

      {/* Importing To (Destination) */}
      <div className={styles.row}>
        <div className={styles.labelCol}>
          <div className={styles.labelRow}>
            <p className={styles.labelText}>Importing To</p>
            <HelpPopover
              title="What's the difference?"
              body="Contacts updates the contact database for people records. Transactional updates a transactional table for activity data. Both updates contacts and transactional data in a single import."
            />
          </div>
          <p className={styles.labelHint}>Select the database you want to update</p>
        </div>
        <div className={styles.inputCol}>
          <div className={styles.segmented}>
            {DATA_TYPES.map((dt) => (
              <button
                key={dt.value}
                type="button"
                className={`${styles.segmentBtn} ${dataType === dt.value ? styles.segmentBtnActive : ''}`}
                onClick={() => onUpdate({ dataType: dt.value })}
              >
                {dt.label}
              </button>
            ))}
          </div>

          {/* Contacts Database — shown for contact and both */}
          {(dataType === 'contact' || dataType === 'both') && (
            <div>
              <p className={styles.inputLabel}>Contacts Database</p>
              <input
                className={styles.textInput}
                type="text"
                value="Customer Contacts"
                disabled
              />
            </div>
          )}

          {/* Transactional Database — shown for transactional and both */}
          {(dataType === 'transactional' || dataType === 'both') && (
            <div>
              <p className={styles.inputLabel}>Transactional Database</p>
              <select
                className={styles.select}
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
