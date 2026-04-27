import { useState, useCallback } from 'react';
import { ChatCircle, X } from '@phosphor-icons/react';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './FeedbackWidget.module.css';

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function FeedbackWidget() {
  const { comments, commentCountForPage, addComment, deleteComment, isOpen, togglePanel } =
    useFeedback();
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const count = commentCountForPage(location.pathname);
  const canSubmit = body.trim().length > 0 && !submitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await addComment(body);
      setBody('');
    } catch (err) {
      console.warn('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  }, [body, canSubmit, addComment]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        className={styles.fab}
        onClick={togglePanel}
        aria-label="Toggle feedback panel"
      >
        <ChatCircle size={24} weight="fill" />
        {count > 0 && <span className={styles.badge}>{count}</span>}
      </button>

      {/* Slide-out panel */}
      {isOpen && (
        <>
          <div className={styles.overlay} onClick={togglePanel} />
          <div className={styles.panel} role="dialog" aria-label="Feedback comments">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Feedback</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={togglePanel}
                aria-label="Close feedback panel"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className={styles.thread}>
              {comments.length === 0 ? (
                <p className={styles.emptyState}>No comments on this page yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{comment.userDisplayName}</span>
                      <span>
                        <span className={styles.commentTime}>
                          {formatTimestamp(comment.createdAt)}
                        </span>
                        {user && user.id === comment.userId && (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => deleteComment(comment.id)}
                            aria-label="Delete comment"
                          >
                            Delete
                          </button>
                        )}
                      </span>
                    </div>
                    <p className={styles.commentBody}>{comment.body}</p>
                  </div>
                ))
              )}
            </div>

            <div className={styles.inputArea}>
              <textarea
                className={styles.textarea}
                placeholder="Leave feedback on this page…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
              />
              <button
                type="button"
                className={styles.submitBtn}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {submitting ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
