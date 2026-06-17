import React from 'react';
import { TruncatedText } from '../shared/TruncatedText';
import type { ImporterConfig, UpdateType, BlankValueHandling } from '../../models/importer';

interface ImporterReviewStepProps {
  config: ImporterConfig;
}

const UPDATE_TYPE_LABELS: Record<UpdateType, string> = {
  'append-update': 'Append / Update',
  'append': 'Append Only',
  'update': 'Update Only',
};

const BLANK_VALUE_LABELS: Record<BlankValueHandling, string> = {
  'preserve': 'Preserve Existing Data',
  'import': 'Import Blank Values',
};

function formatPathMode(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

export function ImporterReviewStep({ config }: ImporterReviewStepProps) {
  const showContact = config.dataType === 'contact' || config.dataType === 'both';
  const showTransactional = config.dataType === 'transactional' || config.dataType === 'both';

  return (
    <div className="flex flex-col gap-6 max-w-xl">

      {/* File Settings */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">File Settings</h4>
        </div>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">Path Mode</span>
          <span className="text-sm text-foreground font-medium">{formatPathMode(config.filePathConfig.pathMode)}</span>
          {config.filePathConfig.folderName && (
            <>
              <span className="text-sm text-muted-foreground">Folder Name</span>
              <span className="text-sm text-foreground font-medium">{config.filePathConfig.folderName}</span>
            </>
          )}
          {config.filePathConfig.readPath && (
            <>
              <span className="text-sm text-muted-foreground">Read Path</span>
              <span className="text-sm text-foreground font-medium">{config.filePathConfig.readPath}</span>
            </>
          )}
          {config.filePathConfig.errorFolderPath && (
            <>
              <span className="text-sm text-muted-foreground">Error Folder</span>
              <span className="text-sm text-foreground font-medium">{config.filePathConfig.errorFolderPath}</span>
            </>
          )}
          {config.filePathConfig.archiveFolderPath && (
            <>
              <span className="text-sm text-muted-foreground">Archive Folder</span>
              <span className="text-sm text-foreground font-medium">{config.filePathConfig.archiveFolderPath}</span>
            </>
          )}
          {config.filePathConfig.fileNamePattern && (
            <>
              <span className="text-sm text-muted-foreground">File Pattern</span>
              <span className="text-sm text-foreground font-medium">{config.filePathConfig.fileNamePattern}</span>
            </>
          )}
          {config.dataType && (
            <>
              <span className="text-sm text-muted-foreground">Data Type</span>
              <span className="text-sm text-foreground font-medium capitalize">{config.dataType === 'both' ? 'Contacts & Transactional' : config.dataType === 'contact' ? 'Contacts' : 'Transactional'}</span>
            </>
          )}
        </div>
      </div>

      {/* Contact Configuration */}
      {showContact && (
        <div className="border-l-2 border-primary pl-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground m-0">Contact Configuration</h4>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
            <span className="text-sm text-muted-foreground">Update Type</span>
            <span className="text-sm text-foreground font-medium">{UPDATE_TYPE_LABELS[config.contactConfig.updateType]}</span>
            <span className="text-sm text-muted-foreground">Blank Values</span>
            <span className="text-sm text-foreground font-medium">{BLANK_VALUE_LABELS[config.contactConfig.blankValueHandling]}</span>
            <span className="text-sm text-muted-foreground">Matching Fields</span>
            <span className="text-sm text-foreground font-medium">{config.contactConfig.matchingFields.length > 0 ? config.contactConfig.matchingFields.join(', ') : 'None'}</span>
          </div>
        </div>
      )}

      {/* Contact Mapping */}
      {showContact && config.contactMapping.length > 0 && (
        <div className="border-l-2 border-primary pl-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground m-0">Contact Mapping</h4>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
            {config.contactMapping.map((mapping, index) => (
              <React.Fragment key={index}>
                <TruncatedText className="text-sm text-muted-foreground">{mapping.sourceField}</TruncatedText>
                <span className="text-sm text-primary font-medium flex items-center gap-6">
                  <span className="text-muted-foreground">→</span>
                  <TruncatedText>{mapping.targetField}</TruncatedText>
                </span>
              </React.Fragment>
            ))}
          </div>
          <p className="mt-2 mb-0 text-xs text-muted-foreground">{config.contactMapping.length} field{config.contactMapping.length !== 1 ? 's' : ''} mapped</p>
        </div>
      )}

      {/* Transactional Configuration */}
      {showTransactional && (
        <div className="border-l-2 border-primary pl-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground m-0">Transactional Configuration</h4>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
            <span className="text-sm text-muted-foreground">Update Type</span>
            <span className="text-sm text-foreground font-medium">{UPDATE_TYPE_LABELS[config.transactionalConfig.updateType]}</span>
            <span className="text-sm text-muted-foreground">Blank Values</span>
            <span className="text-sm text-foreground font-medium">{BLANK_VALUE_LABELS[config.transactionalConfig.blankValueHandling]}</span>
            <span className="text-sm text-muted-foreground">Matching Fields</span>
            <span className="text-sm text-foreground font-medium">{config.transactionalConfig.matchingFields.length > 0 ? config.transactionalConfig.matchingFields.join(', ') : 'None'}</span>
          </div>
        </div>
      )}

      {/* Transactional Mapping */}
      {showTransactional && config.transactionalMapping.length > 0 && (
        <div className="border-l-2 border-primary pl-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground m-0">Transactional Mapping</h4>
          </div>
          <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
            {config.transactionalMapping.map((mapping, index) => (
              <React.Fragment key={index}>
                <TruncatedText className="text-sm text-muted-foreground">{mapping.sourceField}</TruncatedText>
                <span className="text-sm text-primary font-medium flex items-center gap-6">
                  <span className="text-muted-foreground">→</span>
                  <TruncatedText>{mapping.targetField}</TruncatedText>
                </span>
              </React.Fragment>
            ))}
          </div>
          <p className="mt-2 mb-0 text-xs text-muted-foreground">{config.transactionalMapping.length} field{config.transactionalMapping.length !== 1 ? 's' : ''} mapped</p>
        </div>
      )}

      {/* Notifications */}
      <div className="border-l-2 border-primary pl-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground m-0">Notifications</h4>
        </div>
        <div className="grid grid-cols-[160px_1fr] gap-x-10 gap-y-1">
          <span className="text-sm text-muted-foreground">Failure</span>
          <span className="text-sm text-foreground font-medium">
            {config.notifications.failureEmails.length > 0 ? config.notifications.failureEmails.join(', ') : 'No recipients'}
          </span>
          <span className="text-sm text-muted-foreground">Success</span>
          <span className="text-sm text-foreground font-medium">
            {config.notifications.successEnabled
              ? config.notifications.successEmails.length > 0
                ? config.notifications.successEmails.join(', ')
                : 'Enabled (no recipients)'
              : 'Disabled'}
          </span>
          <span className="text-sm text-muted-foreground">No File Alert</span>
          <span className="text-sm text-foreground font-medium">
            {config.notifications.noFileAlertEnabled
              ? config.notifications.noFileAlertEmails.length > 0
                ? config.notifications.noFileAlertEmails.join(', ')
                : 'Enabled (no recipients)'
              : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
}
