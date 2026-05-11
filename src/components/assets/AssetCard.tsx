import { Image, FileText } from '@phosphor-icons/react';
import type { Asset } from '../../models/asset';

interface AssetCardProps {
  asset: Asset;
  onClick: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

function AssetPreview({ asset }: { asset: Asset }) {
  switch (asset.type) {
    case 'image':
      return (
        <div className="h-[120px] flex items-center justify-center bg-background border-b border-border text-tertiary-foreground">
          <Image size={48} weight="thin" />
        </div>
      );
    case 'colour':
      return (
        <div className="h-[120px] flex items-center justify-center bg-background border-b border-border">
          <div
            className="w-full h-full"
            style={{ backgroundColor: asset.colourValue ?? '#cccccc' }}
          />
        </div>
      );
    case 'font':
      return (
        <div className="h-[120px] flex items-center justify-center bg-background border-b border-border">
          <span className="text-4xl font-semibold text-foreground tracking-tight">Aa</span>
        </div>
      );
    case 'footer':
      return (
        <div className="h-[120px] flex items-center justify-center bg-background border-b border-border text-tertiary-foreground">
          <FileText size={48} weight="thin" />
        </div>
      );
  }
}

export function AssetCard({ asset, onClick }: AssetCardProps) {
  return (
    <div
      className="border border-border rounded-md bg-background shadow-sm cursor-pointer transition-[box-shadow,border-color] duration-150 overflow-hidden hover:shadow-md hover:border-border-strong focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      onClick={() => onClick(asset.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(asset.id);
        }
      }}
    >
      <AssetPreview asset={asset} />
      <div className="p-3 flex flex-col gap-2">
        <p className="text-sm font-semibold text-foreground m-0 whitespace-nowrap overflow-hidden text-ellipsis">{asset.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-medium capitalize">{asset.type}</span>
          <span className="text-[10px] text-tertiary-foreground">{asset.scope}</span>
        </div>
        <span className="text-[10px] text-tertiary-foreground mt-auto">{formatDate(asset.createdAt)}</span>
      </div>
    </div>
  );
}
