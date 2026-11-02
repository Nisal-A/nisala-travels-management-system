import React from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Shared input / label classes for settings forms (docs/UI_SPEC.md "Forms and settings"). */
export const settingsInputClass =
    'h-auto px-3 py-2.5 rounded-lg border text-sm focus-visible:ring-2 focus-visible:ring-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed';
export const settingsLabelClass = 'text-sm font-medium mb-1 text-foreground';

interface SettingsPanelFooter {
    isDirty: boolean;
    processing: boolean;
    onCancel: () => void;
    /** Optional status message shown on the left of the footer (rendered with role="status"). */
    status?: React.ReactNode;
    saveLabel?: string;
}

interface SettingsPanelProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    headerAction?: React.ReactNode;
    children: React.ReactNode;
    /** When provided the panel renders as a <form> with a sticky Cancel / Save footer. */
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    footer?: SettingsPanelFooter;
}

/**
 * Right-hand settings panel: card with scrolling body and (optional) sticky footer.
 * Tabs without a form simply omit `onSubmit` / `footer`, which hides the footer entirely.
 */
export function SettingsPanel({ title, description, icon: Icon, headerAction, children, onSubmit, footer }: SettingsPanelProps) {
    const body = (
        <>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="size-8 rounded-lg grid place-items-center bg-primary/10 text-primary shrink-0">
                            <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-foreground">{title}</h2>
                            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
                        </div>
                    </div>
                    {headerAction && <div className="shrink-0">{headerAction}</div>}
                </div>
                {children}
            </div>

            {footer && onSubmit && (
                <div className="sticky bottom-0 px-6 py-4 border-t bg-muted/50 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                    <div role="status" aria-live="polite" className="text-xs text-muted-foreground min-h-4">
                        {footer.status}
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={footer.onCancel}
                            disabled={!footer.isDirty || footer.processing}
                            className="h-9 px-4"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!footer.isDirty || footer.processing}
                            className="h-9 px-6 py-2 font-semibold gap-2"
                        >
                            {footer.processing && <Loader2 className="size-4 animate-spin" />}
                            {footer.processing ? 'Saving…' : (footer.saveLabel ?? 'Save changes')}
                        </Button>
                    </div>
                </div>
            )}
        </>
    );

    const shellClass =
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:max-h-[calc(100dvh-14rem)]';

    if (onSubmit) {
        return (
            <form onSubmit={onSubmit} className={shellClass}>
                {body}
            </form>
        );
    }

    return <div className={shellClass}>{body}</div>;
}
