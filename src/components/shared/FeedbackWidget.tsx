import { useState, useCallback } from 'react';
import { ChatCircle } from '@phosphor-icons/react';
import { useFeedback } from '../../contexts/FeedbackContext';
import { useAuth } from '../../contexts/AuthContext';
import { CloseButton } from '../ui/close-button';

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
        className="fixed bottom-20 right-6 z-[9990] w-12 h-12 rounded-full border-none bg-primary text-primary-foreground cursor-pointer flex items-center justify-center shadow-[0px_7px_10px_-3px_rgba(0,0,0,0.08)] transition-colors duration-150 hover:bg-accent-hover"
        onClick={togglePanel}
        aria-label="Toggle feedback panel"
      >
        <ChatCircle size={24} weight="fill" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-[10px] bg-destructive text-primary-foreground font-sans text-[11px] font-semibold flex items-center justify-center px-[5px] leading-none">
            {count}
          </span>
        )}
      </button>

      {/* Slide-out panel */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[9991] bg-black/20"
            onClick={togglePanel}
          />
          <div
            className="fixed top-0 right-0 bottom-0 w-[380px] max-w-[100vw] z-[9992] bg-background border-l border-border shadow-[-4px_0_20px_rgba(0,0,0,0.08)] flex flex-col animate-[slideInPanel_0.2s_ease-out]"
            role="dialog"
            aria-label="Feedback comments"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-sans text-base font-semibold text-foreground m-0">
                Feedback
              </h2>
              <CloseButton
                size="lg"
                onClick={togglePanel}
                aria-label="Close feedback panel"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {comments.length === 0 ? (
                <p className="text-center text-tertiary-foreground font-sans text-base py-8">
                  No comments on this page yet.
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-background border border-border rounded">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-sans text-[13px] font-semibold text-foreground">
                        {comment.userDisplayName}
                      </span>
                      <span>
                        <span className="font-sans text-[11px] text-tertiary-foreground">
                          {formatTimestamp(comment.createdAt)}
                        </span>
                        {user && user.id === comment.userId && (
                          <button
                            type="button"
                            className="bg-none border-none cursor-pointer text-tertiary-foreground text-xs px-1.5 py-0.5 rounded ml-2 hover:text-destructive hover:bg-destructive-subtle"
                            onClick={() => deleteComment(comment.id)}
                            aria-label="Delete comment"
                          >
                            Delete
                          </button>
                        )}
                      </span>
                    </div>
                    <p className="font-sans text-base leading-5 text-muted-foreground whitespace-pre-wrap break-words m-0">
                      {comment.body}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="px-5 py-4 border-t border-border flex flex-col gap-2">
              <textarea
                className="w-full min-h-[72px] px-3 py-2.5 border border-border rounded font-sans text-base leading-5 text-foreground resize-y outline-none box-border focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-tertiary-foreground"
                placeholder="Leave feedback on this page…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={3}
              />
              <button
                type="button"
                className="self-end px-4 py-2 border-none rounded bg-primary text-primary-foreground font-sans text-base font-semibold cursor-pointer transition-colors duration-150 hover:not-disabled:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
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
