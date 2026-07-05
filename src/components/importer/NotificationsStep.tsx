import { NotificationsStep as SharedNotificationsStep } from '../shared/NotificationsStep';
import type { NotificationConfig } from '../../models/importer';
import { DEFAULT_NOTIFICATION_CONFIG } from '../../models/importer';
import type { ExporterNotificationConfig } from '../../models/wizard';

/* ── Props ── */
interface NotificationsStepProps {
  value?: NotificationConfig;
  onUpdate?: (config: NotificationConfig) => void;
  onValidChange?: (valid: boolean) => void;
  /** List of team member emails to show as suggestions */
  teamEmails?: string[];
}

/**
 * Importer NotificationsStep — thin wrapper around the shared NotificationsStep.
 * Adapts between the importer's NotificationConfig (no schedule) and the shared
 * component's ExporterNotificationConfig (includes optional noFileSchedule).
 */
export function NotificationsStep({ value, onUpdate, onValidChange, teamEmails }: NotificationsStepProps) {
  const initial = value ?? DEFAULT_NOTIFICATION_CONFIG;

  /* Convert importer NotificationConfig → ExporterNotificationConfig (compatible since noFileSchedule is optional) */
  const sharedValue: ExporterNotificationConfig = {
    failureEmails: initial.failureEmails,
    successEnabled: initial.successEnabled,
    successEmails: initial.successEmails,
    noFileAlertEnabled: initial.noFileAlertEnabled,
    noFileAlertEmails: initial.noFileAlertEmails,
  };

  /* Convert back: strip noFileSchedule and pass the base fields to the importer's onUpdate */
  function handleUpdate(config: ExporterNotificationConfig) {
    onUpdate?.({
      failureEmails: config.failureEmails,
      successEnabled: config.successEnabled,
      successEmails: config.successEmails,
      noFileAlertEnabled: config.noFileAlertEnabled,
      noFileAlertEmails: config.noFileAlertEmails,
    });
  }

  return (
    <SharedNotificationsStep
      value={sharedValue}
      onUpdate={handleUpdate}
      onValidChange={onValidChange}
      teamEmails={teamEmails}
      showNoFileAlert
    />
  );
}
