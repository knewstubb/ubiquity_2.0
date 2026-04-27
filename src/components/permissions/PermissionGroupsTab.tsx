import { useState, useCallback } from 'react';
import type { FunctionalPermissions } from '../../models/permissions';
import { usePermissions } from '../../contexts/PermissionsContext';
import { FUNCTIONAL_GROUPS } from '../../data/permissions';
import { GroupSidebar } from './GroupSidebar';
import { PermissionCard } from './PermissionCard';
import { DeleteGroupDialog } from './DeleteGroupDialog';
import styles from './PermissionGroupsTab.module.css';

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
      <div className={styles.emptyState}>
        Select a permission group or create a new one
      </div>
    );
  }

  function renderForm(mode: 'create' | 'edit') {
    return (
      <div className={styles.detail}>
        <div className={styles.form}>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="group-name">
              Name
            </label>
            <input
              id="group-name"
              className={styles.formInput}
              type="text"
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value);
                if (nameError) setNameError('');
              }}
              placeholder="e.g. Marketing Team"
            />
            {nameError && <p className={styles.validationError}>{nameError}</p>}
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel} htmlFor="group-description">
              Description
            </label>
            <input
              id="group-description"
              className={styles.formInput}
              type="text"
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="Describe this permission group"
            />
          </div>
          <div className={styles.cardGrid}>
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
          <div className={styles.formActions}>
            <button
              className={styles.saveButton}
              onClick={mode === 'create' ? handleSaveCreate : handleSaveEdit}
            >
              {mode === 'create' ? 'Create Group' : 'Save Changes'}
            </button>
            <button className={styles.cancelButton} onClick={handleCancel}>
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
      <div className={styles.detail}>
        <div className={styles.detailHeader}>
          <h2 className={styles.groupName}>{selectedGroup.name}</h2>
          <p className={styles.groupDescription}>{selectedGroup.description}</p>
          <div className={styles.actions}>
            <button className={styles.editButton} onClick={handleEditClick}>
              Edit
            </button>
            <button className={styles.deleteButton} onClick={handleDeleteClick}>
              Delete
            </button>
          </div>
        </div>
        <div className={styles.cardGrid}>
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
    <div className={styles.container}>
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
