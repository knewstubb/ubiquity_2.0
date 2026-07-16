import { useState, useMemo } from 'react';
import { Plus, ArrowsClockwise, ArrowRight, NewspaperClipping } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SyncRuleCard } from '../components/account-sync/SyncRuleCard';
import { CreateSyncRuleModal } from '../components/account-sync/CreateSyncRuleModal';
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed';
import { useAccount } from '../contexts/AccountContext';
import { syncRules as seedRules } from '../data/account-sync';
import type { SyncRule, SyncTableType } from '../models/account-sync';

interface ModalContext {
  tableType: SyncTableType;
  /** For transaction modals, the parent contact rule provides source/target context */
  parentRule?: SyncRule;
  /** Editing an existing rule */
  editRule?: SyncRule;
}

export default function AccountSyncPage() {
  const { accounts, accountsInActiveTree } = useAccount();
  const [rules, setRules] = useState<SyncRule[]>(seedRules);
  const [modalContext, setModalContext] = useState<ModalContext | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Filter rules to those involving accounts in the active tree
  const treeAccountIds = useMemo(() => new Set(accountsInActiveTree.map((a) => a.id)), [accountsInActiveTree]);

  const visibleRules = useMemo(
    () => rules.filter((r) => treeAccountIds.has(r.sourceAccountId) || treeAccountIds.has(r.targetAccountId)),
    [rules, treeAccountIds],
  );

  // Group: contact rules at top level, transaction rules nested under their parent
  const contactRules = visibleRules.filter((r) => r.tableType === 'contact');
  const transactionRules = visibleRules.filter((r) => r.tableType === 'transaction');

  function getAccountName(accountId: string): string {
    return accounts.find((a) => a.id === accountId)?.name ?? accountId;
  }

  // Cascade toggle: pausing a contact rule pauses all its transaction children
  // Resuming a contact rule does NOT auto-resume children (user must manually reactivate)
  function handleToggleContactStatus(ruleId: string) {
    setRules((prev) => {
      const contactRule = prev.find((r) => r.id === ruleId);
      if (!contactRule) return prev;

      const newStatus = contactRule.status === 'active' ? 'paused' : 'active';

      return prev.map((r) => {
        if (r.id === ruleId) return { ...r, status: newStatus };
        // Cascade pause to children (but don't cascade resume)
        if (r.parentRuleId === ruleId && newStatus === 'paused') {
          return { ...r, status: 'paused' };
        }
        return r;
      });
    });
  }

  function handleToggleTransactionStatus(ruleId: string) {
    setRules((prev) => {
      const txRule = prev.find((r) => r.id === ruleId);
      if (!txRule) return prev;

      // Can't resume a transaction rule if its parent contact rule is paused
      if (txRule.status === 'paused' && txRule.parentRuleId) {
        const parentRule = prev.find((r) => r.id === txRule.parentRuleId);
        if (parentRule && parentRule.status === 'paused') return prev;
      }

      return prev.map((r) => (r.id === ruleId ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
    });
  }

  // Cascade delete: deleting a contact rule deletes all its transaction children
  function handleDelete() {
    if (!pendingDeleteId) return;
    const rule = rules.find((r) => r.id === pendingDeleteId);
    if (!rule) { setPendingDeleteId(null); return; }

    if (rule.tableType === 'contact') {
      // Delete contact rule + all child transactions
      setRules((prev) => prev.filter((r) => r.id !== pendingDeleteId && r.parentRuleId !== pendingDeleteId));
    } else {
      // Delete just the transaction rule
      setRules((prev) => prev.filter((r) => r.id !== pendingDeleteId));
    }
    setPendingDeleteId(null);
  }

  function handleSaveRule(rule: SyncRule) {
    setRules((prev) => {
      const existing = prev.findIndex((r) => r.id === rule.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = rule;
        return updated;
      }
      return [...prev, rule];
    });
    setModalContext(null);
  }

  // Open modal for new contact sync rule
  function openNewContactModal() {
    setModalContext({ tableType: 'contact' });
  }

  // Open modal for new transaction sync rule (contextual to a contact rule)
  function openNewTransactionModal(parentRule: SyncRule) {
    setModalContext({ tableType: 'transaction', parentRule });
  }

  // Open modal to edit any rule
  function openEditModal(rule: SyncRule) {
    const parentRule = rule.parentRuleId ? rules.find((r) => r.id === rule.parentRuleId) : undefined;
    setModalContext({ tableType: rule.tableType, editRule: rule, parentRule });
  }

  const activeCount = visibleRules.filter((r) => r.status === 'active').length;
  const pendingDeleteRule = pendingDeleteId ? rules.find((r) => r.id === pendingDeleteId) : null;
  const deleteHasChildren = pendingDeleteRule?.tableType === 'contact'
    && transactionRules.some((t) => t.parentRuleId === pendingDeleteId);

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
            <ArrowsClockwise size={22} weight="duotone" className="text-primary" />
            <h1 className="text-2xl font-semibold text-foreground m-0">Account Sync</h1>
          </div>
          <p className="text-sm text-tertiary-foreground mt-1 mb-0 font-normal">
            {visibleRules.length} sync rule{visibleRules.length !== 1 ? 's' : ''} · {activeCount} active
          </p>
        </div>
        <Button onClick={openNewContactModal}>
          <Plus size={16} weight="bold" className="mr-1.5" />
          New Contact Sync
        </Button>
      </div>

      {/* Rules list */}
      {visibleRules.length === 0 ? (
        <EmptyState onCreateRule={openNewContactModal} />
      ) : (
        <div className="flex flex-col gap-5">
          {contactRules.map((contactRule) => {
            const childTransactions = transactionRules.filter((t) => t.parentRuleId === contactRule.id);
            const isContactPaused = contactRule.status === 'paused';

            return (
              <div
                key={contactRule.id}
                className="border border-border rounded-xl bg-surface/50 p-4 space-y-3"
              >
                {/* Contact rule card */}
                <SyncRuleCard
                  rule={contactRule}
                  sourceAccountName={getAccountName(contactRule.sourceAccountId)}
                  targetAccountName={getAccountName(contactRule.targetAccountId)}
                  onToggleStatus={() => handleToggleContactStatus(contactRule.id)}
                  onEdit={() => openEditModal(contactRule)}
                  onDelete={() => setPendingDeleteId(contactRule.id)}
                />

                {/* Child transaction rules */}
                {childTransactions.length > 0 && (
                  <div className="ml-4 pl-4 border-l-2 border-border space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-tertiary-foreground">
                      Transaction Syncs
                    </span>
                    {childTransactions.map((txRule) => (
                      <SyncRuleCard
                        key={txRule.id}
                        rule={txRule}
                        sourceAccountName={getAccountName(txRule.sourceAccountId)}
                        targetAccountName={getAccountName(txRule.targetAccountId)}
                        onToggleStatus={() => handleToggleTransactionStatus(txRule.id)}
                        onEdit={() => openEditModal(txRule)}
                        onDelete={() => setPendingDeleteId(txRule.id)}
                        nested
                        parentPaused={isContactPaused}
                      />
                    ))}
                  </div>
                )}

                {/* Add Transaction Sync button */}
                <div className="ml-4 pl-4 border-l-2 border-border">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary border border-dashed border-primary/30 rounded-md bg-transparent hover:bg-accent/40 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => openNewTransactionModal(contactRule)}
                    disabled={isContactPaused}
                    title={isContactPaused ? 'Resume the contact sync before adding transaction syncs' : undefined}
                  >
                    <Plus size={12} weight="bold" />
                    <NewspaperClipping size={14} weight="regular" />
                    Add Transaction Sync
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalContext && (
        <CreateSyncRuleModal
          open
          tableType={modalContext.tableType}
          parentRule={modalContext.parentRule}
          rule={modalContext.editRule}
          onSave={handleSaveRule}
          onClose={() => setModalContext(null)}
        />
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
    </div>
  );
}

function EmptyState({ onCreateRule }: { onCreateRule: () => void }) {
  return (
    <div className="border border-dashed border-border rounded-lg bg-secondary/30 py-16 px-8 flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
        <ArrowsClockwise size={24} className="text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground m-0">No sync rules configured</p>
        <p className="text-xs text-muted-foreground mt-1 mb-0">
          Create a contact sync rule to propagate data between accounts in this tree.
          <br />
          Transaction syncs can be added once a contact sync exists.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onCreateRule}>
        <Plus size={14} weight="bold" className="mr-1.5" />
        Create Contact Sync
      </Button>
    </div>
  );
}
