import styles from './ImporterReviewStep.module.css';

export function ImporterReviewStep() {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Review</h3>
      <p className={styles.subtitle}>Review your automation configuration before saving.</p>

      {/* File Settings */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>File Settings</h4>
          <button type="button" className={styles.editLink}>Edit</button>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Path Mode</span>
          <span className={styles.optionValue}>Automatic</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Folder Name</span>
          <span className={styles.optionValue}>onboarding-2026</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Sample File</span>
          <span className={styles.optionValue}>sample-contacts.csv</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Importing To</span>
          <span className={styles.optionValue}>Contacts</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Database</span>
          <span className={styles.optionValue}>Customer Contacts</span>
        </div>
      </div>

      {/* Contact Configuration */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Contact Configuration</h4>
          <button type="button" className={styles.editLink}>Edit</button>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Update Type</span>
          <span className={styles.optionValue}>Append / Update</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Blank Values</span>
          <span className={styles.optionValue}>Preserve Existing Data</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Matching Fields</span>
          <span className={styles.optionValue}>Email, Customer ID</span>
        </div>
      </div>

      {/* Contact Mapping */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Contact Mapping</h4>
          <button type="button" className={styles.editLink}>Edit</button>
        </div>
        <div className={styles.mappingList}>
          <div className={styles.mappingRow}>
            <span className={styles.mappingSource}>policy_number</span>
            <span className={styles.mappingArrow}>→</span>
            <span className={styles.mappingTarget}>policy_id</span>
          </div>
          <div className={styles.mappingRow}>
            <span className={styles.mappingSource}>first_name</span>
            <span className={styles.mappingArrow}>→</span>
            <span className={styles.mappingTarget}>first_name</span>
          </div>
          <div className={styles.mappingRow}>
            <span className={styles.mappingSource}>last_name</span>
            <span className={styles.mappingArrow}>→</span>
            <span className={styles.mappingTarget}>last_name</span>
          </div>
          <div className={styles.mappingRow}>
            <span className={styles.mappingSource}>salutation</span>
            <span className={styles.mappingArrow}>→</span>
            <span className={styles.mappingTarget}>greeting</span>
          </div>
          <div className={styles.mappingRow}>
            <span className={styles.mappingSource}>email_address</span>
            <span className={styles.mappingArrow}>→</span>
            <span className={styles.mappingTarget}>email_address</span>
          </div>
        </div>
        <p className={styles.mappingCount}>5 of 9 fields mapped · 1 ignored · 1 warning</p>
      </div>

      {/* Notifications */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h4 className={styles.sectionTitle}>Notifications</h4>
          <button type="button" className={styles.editLink}>Edit</button>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Failure</span>
          <span className={styles.optionValue}>contact@gmail.com</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>Success</span>
          <span className={styles.optionValue}>Disabled</span>
        </div>
        <div className={styles.optionRow}>
          <span className={styles.optionLabel}>No File Alert</span>
          <span className={styles.optionValue}>Disabled</span>
        </div>
      </div>
    </div>
  );
}
