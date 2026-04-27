import { PageShell } from '../components/layout/PageShell';
import { useAccount } from '../contexts/AccountContext';
import { seedAssets } from '../data/assets';
import styles from './TemplatesPage.module.css';

export default function TemplatesPage() {
  const { filterByAccount } = useAccount();
  const templates = filterByAccount(seedAssets);

  return (
    <PageShell title="Templates" subtitle="Reusable email and content templates">
      {templates.length === 0 ? (
        <p>No templates found</p>
      ) : (
        <div className={styles.grid}>
          {templates.map((t) => (
            <div key={t.id} className={styles.card}>
              <h3 className={styles.cardName}>{t.name}</h3>
              <div className={styles.tags}>
                {t.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
              <p className={styles.meta}>{t.type} · {t.scope}</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
