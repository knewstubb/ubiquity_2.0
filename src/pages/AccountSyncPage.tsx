import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowsClockwise, Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SyncRuleCard } from '../components/account-sync/SyncRuleCard';
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed';
import { useAccount } from '../contexts/AccountContext';
import { useToast } from '../components/shared/Toast';
import { cn } from '@/lib/utils';

// Service layer imports — documents production service ownership
import {
  syncRules as seedRules,
  getContactRules,
  getTransactionRules,
} from '../lib/services/account-sync-service';
import { getAccountTree } from '../lib/services/account-hierarchy';
import { isFeatureEnabled } from '../lib/services/feature-flags';
import type { SyncRule } from '../models/account-sync';
import type { Account } from '../models/account';

export default function AccountSyncPage() {
  const { accounts, selectedAccount, selectedAccountId } = useAccount();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rules, setRules] = useState<SyncRule[]>(seedRules);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  // Check for saved rule from wizard on mount
  useEffect(() => {
    const savedRuleJson = sessionStorage.getItem('account-sync-saved-rule');
    if (!savedRuleJson) return;
    
    try {
      const savedRule = JSON.parse(savedRuleJson) as SyncRule;
      sessionStorage.removeItem('account-sync-saved-rule');
      
      // Validate tableType
      if (savedRule.tableType !== 'contact' && savedRule.tableType !== 'transaction') {
        console.error('Invalid tableType in saved rule:', savedRule.tableType);
        return;
      }
      
      let isUpdate = false;
      setRules((prev) => {
        const existingIndex = prev.findIndex((r) => r.id === savedRule.id);
        if (existingIndex >= 0) {
          // Update existing rule
          isUpdate = true;
          const updated = [...prev];
          updated[existingIndex] = savedRule;
          return updated;
        }
        // Add new rule
        return [...prev, savedRule];
      });
      
      const typeLabel = savedRule.tableType === 'contact' ? 'Contact' : 'Transaction';
      showToast(`${typeLabel} sync rule ${isUpdate ? 'updated' : 'created'}`, 'success');
    } catch {
      // Invalid JSON, ignore
    }
  }, [showToast]);

  // Get the root account for the selected account (walk up the tree)
  const rootAccountId = useMemo(() => {
    if (!selectedAccount) return '';
    let current = selectedAccount;
    while (current.parentId) {
      const parent = accounts.find((a) => a.id === current.parentId);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  }, [selectedAccount, accounts]);

  // Get the full tree under the root account using account-hierarchy service
  const customerTree = useMemo<Account[]>(() => {
    if (!rootAccountId) return [];
    return getAccountTree(rootAccountId, accounts);
  }, [rootAccountId, accounts]);

  const customerTreeIds = useMemo(() => new Set(customerTree.map((a) => a.id)), [customerTree]);

  // Feature flag check — AccountSync must be enabled for the root account
  const isAccountSyncEnabled = useMemo(() => {
    if (!rootAccountId) return false;
    return isFeatureEnabled('AccountSync', rootAccountId);
  }, [rootAccountId]);

  // Filter rules to those involving accounts in the selected customer tree
  const visibleRules = useMemo(
    () => rules.filter((r) => customerTreeIds.has(r.sourceAccountId) || customerTreeIds.has(r.targetAccountId)),
    [rules, customerTreeIds],
  );

  // Group: contact rules at top level, transaction rules nested under their parent
  // Uses service layer functions for consistent filtering logic
  const contactRules = useMemo(() => getContactRules(visibleRules), [visibleRules]);
  const transactionRules = useMemo(() => getTransactionRules(visibleRules), [visibleRules]);

  function getAccountName(accountId: string): string {
    return accounts.find((a) => a.id === accountId)?.name ?? accountId;
  }

  // Cascade toggle: pausing a contact rule pauses all its transaction children
  // Resuming a contact rule does NOT auto-resume children (user must manually reactivate)
  function handleConfirmToggle() {
    if (!pendingToggleId) return;
    
    setRules((prev) => {
      const rule = prev.find((r) => r.id === pendingToggleId);
      if (!rule) return prev;

      const newStatus = rule.status === 'active' ? 'paused' : 'active';

      // For contact rules, cascade pause to children
      if (rule.tableType === 'contact') {
        return prev.map((r) => {
          if (r.id === pendingToggleId) return { ...r, status: newStatus };
          // Cascade pause to children (but don't cascade resume)
          if (r.parentRuleId === pendingToggleId && newStatus === 'paused') {
            return { ...r, status: 'paused' };
          }
          return r;
        });
      }

      // For transaction rules, just toggle the single rule
      return prev.map((r) => (r.id === pendingToggleId ? { ...r, status: newStatus } : r));
    });

    const rule = rules.find((r) => r.id === pendingToggleId);
    const newStatus = rule?.status === 'active' ? 'disabled' : 'enabled';
    const typeLabel = rule?.tableType === 'contact' ? 'Contact' : 'Transaction';
    showToast(`${typeLabel} sync rule ${newStatus}`, 'success');
    setPendingToggleId(null);
  }

  function requestToggleStatus(ruleId: string) {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;

    // For transaction rules, can't enable if parent is paused
    if (rule.tableType === 'transaction' && rule.status === 'paused' && rule.parentRuleId) {
      const parentRule = rules.find((r) => r.id === rule.parentRuleId);
      if (parentRule && parentRule.status === 'paused') {
        showToast('Enable the parent contact sync first', 'error');
        return;
      }
    }

    setPendingToggleId(ruleId);
  }

  // Cascade delete: deleting a contact rule deletes all its transaction children
  function handleDelete() {
    if (!pendingDeleteId) return;
    const rule = rules.find((r) => r.id === pendingDeleteId);
    if (!rule) { setPendingDeleteId(null); return; }

    if (rule.tableType === 'contact') {
      // Delete contact rule + all child transactions
      setRules((prev) => prev.filter((r) => r.id !== pendingDeleteId && r.parentRuleId !== pendingDeleteId));
      showToast('Contact sync rule deleted', 'success');
    } else {
      // Delete just the transaction rule
      setRules((prev) => prev.filter((r) => r.id !== pendingDeleteId));
      showToast('Transaction sync rule deleted', 'success');
    }
    setPendingDeleteId(null);
  }

  function openNewContactSync() {
    navigate('/account-sync/new', {
      state: {
        tableType: 'contact',
        customerAccountId: rootAccountId,
        existingRules: rules,
        availableAccounts: customerTree,
      },
    });
  }

  function openNewTransactionSync(parentRule: SyncRule) {
    navigate(`/account-sync/new/${parentRule.id}`, {
      state: {
        tableType: 'transaction',
        parentRule,
        customerAccountId: rootAccountId,
        existingRules: rules,
        availableAccounts: customerTree,
      },
    });
  }

  function openEditSync(rule: SyncRule) {
    const parentRule = rule.parentRuleId ? rules.find((r) => r.id === rule.parentRuleId) : undefined;
    navigate(`/account-sync/edit/${rule.id}`, {
      state: {
        tableType: rule.tableType,
        editRule: rule,
        parentRule,
        customerAccountId: rootAccountId,
        existingRules: rules,
        availableAccounts: customerTree,
      },
    });
  }

  const activeCount = visibleRules.filter((r) => r.status === 'active').length;
  const pendingDeleteRule = pendingDeleteId ? rules.find((r) => r.id === pendingDeleteId) : null;
  const deleteHasChildren = pendingDeleteRule?.tableType === 'contact'
    && transactionRules.some((t) => t.parentRuleId === pendingDeleteId);
  const pendingToggleRule = pendingToggleId ? rules.find((r) => r.id === pendingToggleId) : null;
  const isEnabling = pendingToggleRule?.status === 'paused';
  const toggleHasChildren = pendingToggleRule?.tableType === 'contact'
    && transactionRules.some((t) => t.parentRuleId === pendingToggleId && t.status === 'active');

  return (
    <div className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-85px)] py-7 px-6 bg-background">
      <Breadcrumb className="mb-3">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/settings">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Account Sync</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-foreground m-0">Account Sync</h1>
          </div>
          <p className="text-sm text-tertiary-foreground mt-1 mb-0 font-normal">
            {visibleRules.length} sync rule{visibleRules.length !== 1 ? 's' : ''} · {activeCount} active
          </p>
        </div>
        {isAccountSyncEnabled && (
          <Button onClick={openNewContactSync}>
            <Plus size={16} weight="bold" className="mr-1.5" />
            New Contact Sync
          </Button>
        )}
      </div>

      {/* Feature flag gate — show disabled state if AccountSync not enabled */}
      {!isAccountSyncEnabled ? (
        <FeatureNotAvailable />
      ) : (
        <>
          {/* Rules list */}
          {visibleRules.length === 0 ? (
            <EmptyState onCreateRule={openNewContactSync} />
          ) : (
            <div className="flex flex-col gap-4">
              {contactRules.map((contactRule) => {
                const childTransactions = transactionRules.filter((t) => t.parentRuleId === contactRule.id);
                const isContactPaused = contactRule.status === 'paused';

                return (
                  <div
                    key={contactRule.id}
                    className={cn(
                      'border border-border rounded-lg bg-card overflow-hidden',
                    )}
                  >
                    {/* Contact rule row */}
                    <SyncRuleCard
                      rule={contactRule}
                      sourceAccountName={getAccountName(contactRule.sourceAccountId)}
                      targetAccountName={getAccountName(contactRule.targetAccountId)}
                      onToggleStatus={() => requestToggleStatus(contactRule.id)}
                      onEdit={() => openEditSync(contactRule)}
                      onDelete={() => setPendingDeleteId(contactRule.id)}
                    />

                    {/* Child transaction rules */}
                    {childTransactions.map((txRule) => (
                      <div key={txRule.id} className="border-t border-border">
                        <SyncRuleCard
                          rule={txRule}
                          sourceAccountName={getAccountName(txRule.sourceAccountId)}
                          targetAccountName={getAccountName(txRule.targetAccountId)}
                          onToggleStatus={() => requestToggleStatus(txRule.id)}
                          onEdit={() => openEditSync(txRule)}
                          onDelete={() => setPendingDeleteId(txRule.id)}
                          nested
                          parentPaused={isContactPaused}
                        />
                      </div>
                    ))}

                    {/* Add Transactional Sync */}
                    <div
                      className={cn(
                        'border-t border-border px-5 py-3.5 cursor-pointer transition-colors duration-150 hover:bg-accent/40',
                        isContactPaused && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                      )}
                      role="button"
                      tabIndex={0}
                      onClick={() => { if (!isContactPaused) openNewTransactionSync(contactRule); }}
                      onKeyDown={(e) => { if (!isContactPaused && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openNewTransactionSync(contactRule); } }}
                      title={isContactPaused ? 'Resume the contact sync before adding transaction syncs' : undefined}
                    >
                      <span className="flex items-center gap-3 text-sm font-semibold text-primary">
                        <Plus size={20} weight="bold" className="shrink-0" />
                        Add Transactional Sync
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialogComposed
        open={!!pendingDeleteId}
        onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
        intent="destructive"
        title={pendingDeleteRule?.tableType === 'contact' ? 'Delete contact sync rule?' : 'Delete transaction sync rule?'}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      >
        {deleteHasChildren
          ? 'This will permanently remove the contact sync rule and all associated transaction sync rules. Data propagation between these accounts will stop immediately.'
          : 'This will permanently remove the sync rule and stop data propagation for this table between these accounts.'
        }
      </AlertDialogComposed>

      {/* Enable/Disable confirmation */}
      <AlertDialogComposed
        open={!!pendingToggleId}
        onOpenChange={(open) => { if (!open) setPendingToggleId(null); }}
        intent="warning"
        title={isEnabling
          ? `Enable ${pendingToggleRule?.tableType} sync?`
          : `Disable ${pendingToggleRule?.tableType} sync?`
        }
        confirmLabel={isEnabling ? 'Enable' : 'Disable'}
        onConfirm={handleConfirmToggle}
        requiresInput="ACCEPT"
        inputLabel="Type ACCEPT to confirm"
      >
        {isEnabling
          ? 'Enabling this sync rule will start propagating data changes between accounts immediately. Make sure your field mappings are correct before proceeding.'
          : toggleHasChildren
            ? 'Disabling this contact sync will also pause all associated transaction syncs. Data changes will no longer propagate between these accounts.'
            : 'Disabling this sync rule will stop data propagation between accounts. Changes made in the source account will not be reflected in the target.'
        }
      </AlertDialogComposed>
    </div>
  );
}

function EmptyState({ onCreateRule }: { onCreateRule: () => void }) {
  return (
    <div className="flex flex-col items-center pt-[20vh] px-6 text-center">
      {/* Visual anchor */}
      <div className="text-zinc-300 dark:text-zinc-600 mb-4">
        <ArrowsClockwise size={48} weight="light" />
      </div>

      {/* Headline */}
      <h2 className="text-xl font-medium text-foreground m-0 mb-2">
        Sync your accounts
      </h2>

      {/* Supporting line */}
      <p className="text-sm text-muted-foreground m-0 mb-6 max-w-[360px]">
        Create a contact sync rule to propagate data between accounts in this tree. Transaction syncs can be added once a contact sync exists.
      </p>

      {/* CTA */}
      <Button size="lg" onClick={onCreateRule}>
        Create Your First Sync
      </Button>
    </div>
  );
}

function FeatureNotAvailable() {
  return (
    <div className="flex flex-col items-center pt-[20vh] px-6 text-center">
      {/* Visual anchor */}
      <div className="text-amber-400 mb-4">
        <Warning size={48} weight="light" />
      </div>

      {/* Headline */}
      <h2 className="text-xl font-medium text-foreground m-0 mb-2">
        Account Sync not available
      </h2>

      {/* Supporting line */}
      <p className="text-sm text-muted-foreground m-0 max-w-[360px]">
        This feature is not enabled for the selected account. Contact your administrator to request access.
      </p>
    </div>
  );
}
