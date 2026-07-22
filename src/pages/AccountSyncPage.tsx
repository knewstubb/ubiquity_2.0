import { useState, useMemo } from 'react';
import { Plus, ArrowsClockwise } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { SyncRuleCard } from '../components/account-sync/SyncRuleCard';
import { CreateSyncRuleModal } from '../components/account-sync/CreateSyncRuleModal';
import { AlertDialogComposed } from '@/components/composed/alert-dialog-composed';
import { useAccount } from '../contexts/AccountContext';
import { useToast } from '../components/shared/Toast';
import { syncRules as seedRules } from '../data/account-sync';
import { cn } from '@/lib/utils';
import type { SyncRule, SyncTableType } from '../models/account-sync';
import type { Account } from '../models/account';

interface ModalContext {
  tableType: SyncTableType;
  /** For transaction modals, the parent contact rule provides source/target context */
  parentRule?: SyncRule;
  /** Editing an existing rule */
  editRule?: SyncRule;
}

export default function AccountSyncPage() {
  const { accounts } = useAccount();
  const { showToast } = useToast();
  const [rules, setRules] = useState<SyncRule[]>(seedRules);
  const [modalContext, setModalContext] = useState<ModalContext | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [selectedCustomerAccountId, setSelectedCustomerAccountId] = useState<string>('');

  // Customer account options — root accounts only (parentId === null)
  const customerAccountOptions = useMemo(
    () => accounts.filter((a) => a.parentId === null).map((a) => ({ value: a.id, label: a.name })),
    [accounts],
  );

  // Get the full tree under the selected customer account (the account + all descendants)
  const customerTree = useMemo<Account[]>(() => {
    if (!selectedCustomerAccountId) return [];
    const tree: Account[] = [];
    const queue = [selectedCustomerAccountId];
    while (queue.length > 0) {
      const id = queue.shift()!;
      const acc = accounts.find((a) => a.id === id);
      if (acc) {
        tree.push(acc);
        queue.push(...acc.childIds);
      }
    }
    return tree;
  }, [selectedCustomerAccountId, accounts]);

  const customerTreeIds = useMemo(() => new Set(customerTree.map((a) => a.id)), [customerTree]);

  // Filter rules to those involving accounts in the selected customer tree
  const visibleRules = useMemo(
    () => rules.filter((r) => customerTreeIds.has(r.sourceAccountId) || customerTreeIds.has(r.targetAccountId)),
    [rules, customerTreeIds],
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
      showToast('Contact sync rule deleted', 'success');
    } else {
      // Delete just the transaction rule
      setRules((prev) => prev.filter((r) => r.id !== pendingDeleteId));
      showToast('Transaction sync rule deleted', 'success');
    }
    setPendingDeleteId(null);
  }

  function handleSaveRule(rule: SyncRule) {
    // Check for duplicate source/target combo (same tableType, same direction)
    const isDuplicate = rules.some((r) =>
      r.id !== rule.id &&
      r.tableType === rule.tableType &&
      r.sourceAccountId === rule.sourceAccountId &&
      r.targetAccountId === rule.targetAccountId,
    );
    if (isDuplicate) {
      showToast('A sync rule with this source/target combination already exists', 'error');
      return;
    }

    const isEditing = rules.some((r) => r.id === rule.id);
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

    if (isEditing) {
      showToast('Sync rule updated', 'success');
    } else {
      const label = rule.tableType === 'contact' ? 'Contact' : 'Transaction';
      showToast(`${label} sync rule created`, 'success');
    }
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
            <h1 className="text-2xl font-semibold text-foreground m-0">Account Sync</h1>
          </div>
          {selectedCustomerAccountId && (
            <p className="text-sm text-tertiary-foreground mt-1 mb-0 font-normal">
              {visibleRules.length} sync rule{visibleRules.length !== 1 ? 's' : ''} · {activeCount} active
            </p>
          )}
        </div>
        {selectedCustomerAccountId && (
          <Button onClick={openNewContactModal}>
            <Plus size={16} weight="bold" className="mr-1.5" />
            New Contact Sync
          </Button>
        )}
      </div>

      {/* Account selector step */}
      {!selectedCustomerAccountId ? (
        <div className="flex flex-col items-center pt-[15vh] px-6 text-center">
          <div className="text-primary mb-4">
            <ArrowsClockwise size={48} weight="light" />
          </div>
          <h2 className="text-xl font-medium text-foreground m-0 mb-2">
            Select a customer account
          </h2>
          <p className="text-sm text-muted-foreground m-0 mb-6 max-w-[280px]">
            Choose the customer account to manage sync rules for.
          </p>
          <div className="w-[280px]">
            <Combobox
              value={selectedCustomerAccountId}
              onValueChange={setSelectedCustomerAccountId}
              options={customerAccountOptions}
              placeholder="Select customer account..."
              searchPlaceholder="Search accounts..."
              className="bg-white"
            />
          </div>
        </div>
      ) : (
        <>
          {/* Account context bar */}
          <div className="flex items-center gap-3 mb-5">
            <Label className="text-sm text-muted-foreground font-normal">Customer:</Label>
            <Combobox
              value={selectedCustomerAccountId}
              onValueChange={setSelectedCustomerAccountId}
              options={customerAccountOptions}
              placeholder="Select customer account..."
              searchPlaceholder="Search accounts..."
              className="bg-white"
            />
          </div>

          {/* Rules list */}
          {visibleRules.length === 0 ? (
            <EmptyState onCreateRule={openNewContactModal} />
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
                      onToggleStatus={() => handleToggleContactStatus(contactRule.id)}
                      onEdit={() => openEditModal(contactRule)}
                      onDelete={() => setPendingDeleteId(contactRule.id)}
                    />

                    {/* Child transaction rules */}
                    {childTransactions.map((txRule) => (
                      <div key={txRule.id} className="border-t border-border">
                        <SyncRuleCard
                          rule={txRule}
                          sourceAccountName={getAccountName(txRule.sourceAccountId)}
                          targetAccountName={getAccountName(txRule.targetAccountId)}
                          onToggleStatus={() => handleToggleTransactionStatus(txRule.id)}
                          onEdit={() => openEditModal(txRule)}
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
                      onClick={() => { if (!isContactPaused) openNewTransactionModal(contactRule); }}
                      onKeyDown={(e) => { if (!isContactPaused && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openNewTransactionModal(contactRule); } }}
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

      {/* Create/Edit Modal */}
      {modalContext && (
        <CreateSyncRuleModal
          open
          tableType={modalContext.tableType}
          parentRule={modalContext.parentRule}
          rule={modalContext.editRule}
          onSave={handleSaveRule}
          onClose={() => setModalContext(null)}
          existingRules={rules}
          availableAccounts={customerTree}
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
