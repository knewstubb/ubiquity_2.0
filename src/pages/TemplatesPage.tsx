import { PageShell } from '../components/layout/PageShell';
import { useAccount } from '../contexts/AccountContext';
import { seedAssets } from '../data/assets';

export default function TemplatesPage() {
  const { filterByAccount } = useAccount();
  const templates = filterByAccount(seedAssets);

  return (
    <PageShell title="Templates" subtitle="Reusable email and content templates">
      {templates.length === 0 ? (
        <p>No templates found</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {templates.map((t) => (
            <div key={t.id} className="bg-white border border-border rounded-md shadow-sm p-5 flex flex-col gap-3">
              <h3 className="text-base font-semibold text-foreground m-0">{t.name}</h3>
              <div className="flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent text-primary">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-muted-foreground m-0">{t.type} · {t.scope}</p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
