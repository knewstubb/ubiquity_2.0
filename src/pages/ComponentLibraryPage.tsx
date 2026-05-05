import { useState } from 'react';
import {
  Plus, X, DownloadSimple, UploadSimple, DotsThree, GearSix,
  PencilSimple, Trash, CaretRight, CaretLeft, CaretDown,
  MagnifyingGlass, CalendarBlank, FunnelSimple, Check, CheckCircle,
  XCircle, Clock, ArrowsClockwise, ListBullets, ClockCounterClockwise,
  Play, Pause, GlobeSimple,
} from '@phosphor-icons/react';
import { Toggle } from '../components/shared/Toggle';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { InitialModal } from '../components/dashboard/InitialModal';
import type { Connection } from '../models/connection';
import styles from './ComponentLibraryPage.module.css';

const SECTIONS = [
  { id: 'typography', label: 'Typography' },
  { id: 'colours', label: 'Colours' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'card-selectors', label: 'Card Selectors' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'toggle', label: 'Toggle' },
  { id: 'chips-tags', label: 'Chips & Tags' },
  { id: 'modals', label: 'Modals' },
  { id: 'icons', label: 'Icons' },
  { id: 'shadows', label: 'Shadows' },
];

const MOCK_CONNECTION: Connection = {
  id: 'conn-demo',
  name: 'Demo SFTP',
  protocol: 'SFTP',
  status: 'connected',
  basePath: '/uploads',
  accountId: 'acc-master',
  config: { host: 'sftp.example.com', port: 22, path: '/data' },
};

export default function ComponentLibraryPage() {
  const [toggleOn, setToggleOn] = useState(true);
  const [toggleOff, setToggleOff] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(false);

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>Components</div>
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} className={styles.sidebarLink}>
            {s.label}
          </a>
        ))}
      </aside>

      {/* Main Content */}
      <main className={styles.content}>
        <h1 className={styles.pageTitle}>Component Library</h1>
        <p className={styles.pageSubtitle}>
          Visual reference of all shared components in their various states.
        </p>

        {/* 1. Typography */}
        <section id="typography" className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography</h2>
          <div className={styles.card}>
            <TypographyRow label="Display L" size="48px" weight="700" />
            <TypographyRow label="Display M" size="36px" weight="700" />
            <TypographyRow label="Heading H1" size="30px" weight="600" />
            <TypographyRow label="Heading H2" size="24px" weight="600" />
            <TypographyRow label="Heading H3" size="20px" weight="600" />
            <TypographyRow label="Heading H4" size="18px" weight="600" />
            <TypographyRow label="Heading H5" size="16px" weight="600" />
            <TypographyRow label="Body L" size="18px" weight="400" />
            <TypographyRow label="Body Base" size="16px" weight="400" />
            <TypographyRow label="Body S" size="14px" weight="400" />
            <TypographyRow label="Body XS" size="12px" weight="400" />
            <TypographyRow label="Body XXS" size="10px" weight="500" />
            <TypographyRow label="Button Standard" size="16px" weight="600" />
            <TypographyRow label="Button Small" size="14px" weight="700" />
          </div>
        </section>

        {/* 2. Colours */}
        <section id="colours" className={styles.section}>
          <h2 className={styles.sectionTitle}>Colours</h2>
          <div className={styles.card}>
            <div className={styles.colourGrid}>
              <ColourSwatch name="Primary (Teal)" variable="--color-mint-500" hex="#14B88A" />
              <ColourSwatch name="Warning (Amber)" variable="--color-amber-500" hex="#F59E0B" />
              <ColourSwatch name="Error (Red)" variable="--color-red-500" hex="#EF4444" />
              <ColourSwatch name="Info (Sky)" variable="--color-sky-400" hex="#38BDF8" />
              <ColourSwatch name="Text Primary" variable="--color-zinc-800" hex="#27272A" />
              <ColourSwatch name="Text Secondary" variable="--color-zinc-600" hex="#52525B" />
              <ColourSwatch name="Text Muted" variable="--color-zinc-400" hex="#A1A1AA" />
              <ColourSwatch name="Surface" variable="--color-zinc-100" hex="#F4F4F5" />
              <ColourSwatch name="Background" variable="--color-zinc-50" hex="#FAFAFA" />
              <ColourSwatch name="Border" variable="--color-zinc-200" hex="#E4E4E7" />
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section id="buttons" className={styles.section}>
          <h2 className={styles.sectionTitle}>Buttons</h2>
          <div className={styles.card}>
            <div className={styles.buttonRow}>
              <span className={styles.buttonLabel}>Primary</span>
              <button type="button" className={styles.btnPrimary}>Default</button>
              <button type="button" className={styles.btnPrimary} disabled>Disabled</button>
            </div>
            <div className={styles.buttonRow}>
              <span className={styles.buttonLabel}>Secondary</span>
              <button type="button" className={styles.btnSecondary}>Default</button>
              <button type="button" className={styles.btnSecondary} disabled>Disabled</button>
            </div>
            <div className={styles.buttonRow}>
              <span className={styles.buttonLabel}>Danger</span>
              <button type="button" className={styles.btnDanger}>Delete</button>
            </div>
            <div className={styles.buttonRow}>
              <span className={styles.buttonLabel}>Icon Button</span>
              <button type="button" className={styles.btnIcon}><Plus size={16} /></button>
              <button type="button" className={styles.btnIcon}><PencilSimple size={16} /></button>
              <button type="button" className={styles.btnIcon}><Trash size={16} /></button>
              <button type="button" className={styles.btnIcon}><DotsThree size={16} /></button>
            </div>
            <div className={styles.buttonRow}>
              <span className={styles.buttonLabel}>Text / Link</span>
              <button type="button" className={styles.btnText}>View details</button>
              <button type="button" className={styles.btnText}>Cancel</button>
            </div>
          </div>
        </section>

        {/* 4. Card Selectors */}
        <section id="card-selectors" className={styles.section}>
          <h2 className={styles.sectionTitle}>Card Selectors</h2>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Automation Type Selector</div>
            <div className={styles.cardSelectorGrid}>
              <div className={styles.selectorCard}>
                <DownloadSimple size={32} />
                <span className={styles.selectorLabel}>Default</span>
              </div>
              <div className={`${styles.selectorCard} ${styles.selectorCardSelected}`}>
                <span className={styles.selectorBadge}><Check size={12} weight="bold" /></span>
                <UploadSimple size={32} />
                <span className={styles.selectorLabel}>Selected</span>
              </div>
              <div className={styles.selectorCard}>
                <DownloadSimple size={32} />
                <span className={styles.selectorLabel}>Hover (zinc-200 border)</span>
              </div>
              <div className={`${styles.selectorCard} ${styles.selectorCardDisabled}`}>
                <UploadSimple size={32} />
                <span className={styles.selectorLabel}>Disabled</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Inputs */}
        <section id="inputs" className={styles.section}>
          <h2 className={styles.sectionTitle}>Inputs</h2>
          <div className={styles.card}>
            <div className={styles.inputsGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Text Input (default)</label>
                <input type="text" className={styles.input} placeholder="Enter value…" />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Text Input (error)</label>
                <input type="text" className={`${styles.input} ${styles.inputError}`} defaultValue="Invalid" />
                <span className={styles.inputErrorText}>This field is required</span>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Text Input (disabled)</label>
                <input type="text" className={styles.input} disabled placeholder="Disabled" />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Select Dropdown</label>
                <select className={styles.select}>
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Date Input</label>
                <input type="date" className={styles.input} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Textarea</label>
                <textarea className={styles.textarea} placeholder="Enter description…" />
              </div>
            </div>
          </div>
        </section>

        {/* 6. Toggle */}
        <section id="toggle" className={styles.section}>
          <h2 className={styles.sectionTitle}>Toggle</h2>
          <div className={styles.card}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleItem}>
                <Toggle checked={toggleOn} onChange={setToggleOn} label="Active" />
                <span className={styles.toggleItemLabel}>On</span>
              </div>
              <div className={styles.toggleItem}>
                <Toggle checked={toggleOff} onChange={setToggleOff} label="Paused" />
                <span className={styles.toggleItemLabel}>Off</span>
              </div>
              <div className={styles.toggleItem}>
                <Toggle checked={true} onChange={() => {}} label="Locked" disabled />
                <span className={styles.toggleItemLabel}>Disabled</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Chips & Tags */}
        <section id="chips-tags" className={styles.section}>
          <h2 className={styles.sectionTitle}>Chips & Tags</h2>
          <div className={styles.card}>
            <div className={styles.cardLabel}>Chips</div>
            <div className={styles.chipRow}>
              <span className={styles.chipSelected}>Selected <X size={12} /></span>
              <span className={styles.chipDefault}>Default</span>
              <span className={styles.chipDefault}>Another Chip</span>
            </div>
            <div className={styles.cardLabel}>Tags</div>
            <div className={styles.chipRow}>
              <span className={`${styles.tag} ${styles.tagGreen}`}>Active</span>
              <span className={`${styles.tag} ${styles.tagGrey}`}>Draft</span>
              <span className={`${styles.tag} ${styles.tagRed}`}>Error</span>
              <span className={`${styles.tag} ${styles.tagBlue}`}>Info</span>
              <span className={`${styles.tag} ${styles.tagAmber}`}>Warning</span>
            </div>
          </div>
        </section>

        {/* 8. Modals */}
        <section id="modals" className={styles.section}>
          <h2 className={styles.sectionTitle}>Modals</h2>
          <div className={styles.card}>
            <div className={styles.buttonRow}>
              <button type="button" className={styles.btnDanger} onClick={() => setShowDeleteModal(true)}>
                Open Delete Confirm
              </button>
              <button type="button" className={styles.btnPrimary} onClick={() => setShowInitialModal(true)}>
                Open Card Selector
              </button>
            </div>
            <p className={styles.modalDescription}>
              Modal patterns: overlay with backdrop click to close, Escape key to close,
              focus trap within dialog, aria-modal and role="dialog" for accessibility.
            </p>
          </div>
        </section>

        {/* 9. Icons */}
        <section id="icons" className={styles.section}>
          <h2 className={styles.sectionTitle}>Icons</h2>
          <div className={styles.card}>
            <div className={styles.iconGrid}>
              <IconItem icon={<Plus size={20} />} name="Plus" />
              <IconItem icon={<X size={20} />} name="X" />
              <IconItem icon={<DownloadSimple size={20} />} name="DownloadSimple" />
              <IconItem icon={<UploadSimple size={20} />} name="UploadSimple" />
              <IconItem icon={<DotsThree size={20} />} name="DotsThree" />
              <IconItem icon={<GearSix size={20} />} name="GearSix" />
              <IconItem icon={<PencilSimple size={20} />} name="PencilSimple" />
              <IconItem icon={<Trash size={20} />} name="Trash" />
              <IconItem icon={<CaretRight size={20} />} name="CaretRight" />
              <IconItem icon={<CaretLeft size={20} />} name="CaretLeft" />
              <IconItem icon={<CaretDown size={20} />} name="CaretDown" />
              <IconItem icon={<MagnifyingGlass size={20} />} name="MagnifyingGlass" />
              <IconItem icon={<CalendarBlank size={20} />} name="CalendarBlank" />
              <IconItem icon={<FunnelSimple size={20} />} name="FunnelSimple" />
              <IconItem icon={<Check size={20} />} name="Check" />
              <IconItem icon={<CheckCircle size={20} />} name="CheckCircle" />
              <IconItem icon={<XCircle size={20} />} name="XCircle" />
              <IconItem icon={<Clock size={20} />} name="Clock" />
              <IconItem icon={<ArrowsClockwise size={20} />} name="ArrowsClockwise" />
              <IconItem icon={<ListBullets size={20} />} name="ListBullets" />
              <IconItem icon={<ClockCounterClockwise size={20} />} name="ClockCounterClockwise" />
              <IconItem icon={<Play size={20} />} name="Play" />
              <IconItem icon={<Pause size={20} />} name="Pause" />
              <IconItem icon={<GlobeSimple size={20} />} name="GlobeSimple" />
            </div>
          </div>
        </section>

        {/* 10. Shadows */}
        <section id="shadows" className={styles.section}>
          <h2 className={styles.sectionTitle}>Shadows</h2>
          <div className={styles.card}>
            <div className={styles.shadowGrid}>
              <div className={styles.shadowBox} style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05), 0 0 0 1px #E4E4E7' }}>
                Shadow S
              </div>
              <div className={styles.shadowBox} style={{ boxShadow: '0 3px 4px -1px rgba(0,0,0,0.08), 0 0 0 1px #E4E4E7' }}>
                Shadow M
              </div>
              <div className={styles.shadowBox} style={{ boxShadow: '0 7px 10px -3px rgba(0,0,0,0.08), 0 0 0 1px #E4E4E7' }}>
                Shadow L
              </div>
              <div className={styles.shadowBox} style={{ boxShadow: '0 15px 20px -5px rgba(0,0,0,0.08), 0 0 0 1px #E4E4E7' }}>
                Shadow XL
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {showDeleteModal && (
        <DeleteConfirmModal
          objectType="Connection"
          objectName="Demo SFTP Connection"
          onConfirm={() => setShowDeleteModal(false)}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      {showInitialModal && (
        <InitialModal
          connection={MOCK_CONNECTION}
          onProceed={() => setShowInitialModal(false)}
          onClose={() => setShowInitialModal(false)}
        />
      )}
    </div>
  );
}

function TypographyRow({ label, size, weight }: { label: string; size: string; weight: string }) {
  return (
    <div className={styles.typeRow}>
      <span className={styles.typeMeta}>{label} · {size} / {weight}</span>
      <span style={{ fontSize: size, fontWeight: Number(weight), color: '#27272A' }}>
        The quick brown fox
      </span>
    </div>
  );
}

function ColourSwatch({ name, variable, hex }: { name: string; variable: string; hex: string }) {
  return (
    <div className={styles.colourSwatch}>
      <div className={styles.swatchBox} style={{ background: hex }} />
      <span className={styles.swatchName}>{name}</span>
      <span className={styles.swatchValue}>{variable} · {hex}</span>
    </div>
  );
}

function IconItem({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <div className={styles.iconItem}>
      {icon}
      <span className={styles.iconName}>{name}</span>
    </div>
  );
}
