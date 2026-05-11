import { useState, useCallback } from 'react';
import type { FunctionalPermissions } from '../../models/permissions';
import { usePermissions } from '../../contexts/PermissionsContext';
import { FUNCTIONAL_GROUPS } from '../../data/permissions';
import { GroupSidebar } from './GroupSidebar';
import { PermissionCard } from './PermissionCard';
import { DeleteGroupDialog } from './DeleteGroupDialog';

type CrudKey = 'create' | 'read' | 'update' | 'delete';

function makeEmptyPermissions(): Record<string, FunctionalPermissions> {
  const perms: Record<string, FunctionalPermissions> = {};
  for (const fg of FUNCTIONAL_GROUPS) {
    perms[fg] = { create: false, read: false, update: false, delete: false };
  }
  return perms;
}

export function PermissionGroupsTab() {
  const { permissionGroups, assignments, addPermissionGroup, updatePermissionGroup, deletePermissionGroup } = usePermissions();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Draft state for create/edit
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftPermissions, setDraftPermissions] = useState<Record<string, FunctionalPermissions>>(
    makeEmptyPermissions,
  );
  const [nameError, setNameError] = useState('');

  const selectedGroup = permissionGroups.find((g) => g.id === selectedGroupId) ?? null;

  // --- Handlers ---

  const handleSelectGroup = useCallback(
    (id: string) => {
      if (isCreating || isEditing) return;
      setSelectedGroupId(id);
    },
    [isCreating, isEditing],
  );

  const handleCreateClick = useCallback(() => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedGroupId(null);
    setDraftName('');
    setDraftDescription('');
    setDraftPermissions(makeEmptyPermissions());
    setNameError('');
  }, []);

  const handleEditClick = useCallback(() => {
    if (!selectedGroup) return;
    setIsEditing(true);
    setIsCreating(false);
    setDraftName(selectedGroup.name);
    setDraftDescription(selectedGroup.description);
    setDraftPermissions(
      JSON.parse(JSON.stringify(selectedGroup.permissions)) as Record<string, FunctionalPermissions>,
    );
    setNameError('');
  }, [selectedGroup]);

  const handleCancel = useCallback(() => {
    setIsCreating(false);
    setIsEditing(false);
    setDraftName('');
    setDraftDescription('');
    setDraftPermissions(makeEmptyPermissions());
    setNameError('');
  }, []);

  const handleToggle = useCallback(
    (functionalGroup: string, permission: CrudKey, value: boolean) => {
      setDraftPermissions((prev) => ({
        ...prev,
        [functionalGroup]: {
          ...prev[functionalGroup],
          [permission]: value,
        },
      }));
    },
    [],
  );

  const hasAnyPermission = useCallback(
    (perms: Record<string, FunctionalPermissions>): boolean => {
      return Object.values(perms).some(
        (fp) => fp.create || fp.read || fp.update || fp.delete,
      );
    },
    [],
  );

  const handleSaveCreate = useCallback(() => {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setNameError('Name is required');
      return;
    }
    if (!hasAnyPermission(draftPermissions)) {
      setNameError('Select at least one permission');
      return;
    }
    const newId = `grp-${Date.now()}`;
    addPermissionGroup({
      id: newId,
      name: trimmedName,
      description: draftDescription,
      permissions: draftPermissions,
    });
    setSelectedGroupId(newId);
    setIsCreating(false);
    setDraftName('');
    setDraftDescription('');
    setDraftPermissions(makeEmptyPermissions());
    setNameError('');
  }, [draftName, draftDescription, draftPermissions, hasAnyPermission, addPermissionGroup]);

  const handleSaveEdit = useCallback(() => {
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setNameError('Name is required');
      return;
    }
    if (selectedGroupId) {
      updatePermissionGroup(selectedGroupId, {
        name: trimmedName,
        description: draftDescription,
        permissions: draftPermissions,
      });
    }
    setIsEditing(false);
    setDraftName('');
    setDraftDescription('');
    setDraftPermissions(makeEmptyPermissions());
    setNameError('');
  }, [draftName, draftDescription, draftPermissions, selectedGroupId, updatePermissionGroup]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (selectedGroupId) {
      deletePermissionGroup(selectedGroupId);
    }
    setShowDeleteDialog(false);
    setSelectedGroupId(null);
  }, [selectedGroupId, deletePermissionGroup]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  // Count users affected by deleting the selected group
  const affectedUserCount = selectedGroup
    ? new Set(
        assignments
          .filter((a) => a.permissionGroupId === selectedGroup.id)
          .map((a) => a.userId),
      ).size
    : 0;

  // --- Render helpers ---

  function renderEmptyState() {
    return (
      <div className="flex items-center justify-center h-full font-sans text-base text-tertiary-foreground">
        Select a permission group or create a new one
      </div>
    );
  }

  function renderForm(mode: 'create' | 'edit') {
    return (
      <div className="p-6 overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-sans text-sm font-medium text-foreground" htmlFor="group-name">
              Name
            </label>
            <input
              id="group-name"
              className="px-3 py-2 border border-border rounded-md font-sans text-sm text-foreground bg-background transition-colors duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-accent placeholder:text-tertiary-foreground"
              type="text"
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="e.g. Marketing Team"
            />
            {nameError && <p className="font-sans text-xs text-destructive m-0">{nameError}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-sans text-sm font-medium text-foreground" htmlFor="group-description">
              Description
            </label>
            <input
              id="group-description"
              className="px-3 py-2 border border-border rounded-md font-sans text-sm text-foreground bg-background transition-colors duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-accent placeholder:text-tertiary-foreground"
              type="text"
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="Describe this permission group"
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            {FUNCTIONAL_GROUPS.map((fg) => (
              <PermissionCard
                key={fg}
                functionalGroup={fg}
                permissions={draftPermissions[fg] ?? { create: false, read: false, update: false, delete: false }}
                editable
                onToggle={(permission, value) => handleToggle(fg, permission, value)}
              />
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <button
              className="px-4 py-2 border-none rounded-md bg-primary font-sans text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={mode === 'create' ? handleSaveCreate : handleSaveEdit}
            >
              {mode === 'create' ? 'Create Group' : 'Save Changes'}
            </button>
            <button
              className="px-4 py-2 border border-border rounded-md bg-transparent font-sans text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  function renderGroupDetail() {
    if (!selectedGroup) return renderEmptyState();

    return (
      <div className="p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="font-sans text-xl font-semibold text-foreground m-0 mb-1">{selectedGroup.name}</h2>
          <p className="font-sans text-sm text-muted-foreground m-0 mb-4 leading-normal">{selectedGroup.description}</p>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 border border-border rounded-md bg-transparent font-sans text-sm font-medium text-foreground cursor-pointer transition-colors duration-150 hover:bg-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              onClick={handleEditClick}
            >
              Edit
            </button>
            <button
              className="px-4 py-2 border-none rounded-md bg-destructive font-sans text-sm font-medium text-primary-foreground cursor-pointer transition-colors duration-150 hover:bg-danger-hover focus-visible:outline-2 focus-visible:outline-destructive focus-visible:outline-offset-2"
              onClick={handleDeleteClick}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 mt-6">
          {FUNCTIONAL_GROUPS.map((fg) => (
            <PermissionCard
              key={fg}
              functionalGroup={fg}
              permissions={
                selectedGroup.permissions[fg] ?? { create: false, read: false, update: false, delete: false }
              }
              editable={false}
            />
          ))}
        </div>
      </div>
    );
  }

  // --- Main render ---

  return (
    <div className="grid grid-cols-[280px_1fr] h-full overflow-hidden">
      <GroupSidebar
        groups={permissionGroups}
        selectedGroupId={selectedGroupId}
        onSelectGroup={handleSelectGroup}
        onCreateClick={handleCreateClick}
      />
      {isCreating
        ? renderForm('create')
        : isEditing
          ? renderForm('edit')
          : renderGroupDetail()}
      <DeleteGroupDialog
        open={showDeleteDialog}
        groupName={selectedGroup?.name ?? ''}
        affectedUserCount={affectedUserCount}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
