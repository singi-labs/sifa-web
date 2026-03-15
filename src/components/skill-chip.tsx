'use client';

import { useState, useCallback, useId } from 'react';
import { CheckCircle, Lightning, X } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import type { ProfileSkill } from '@/lib/types';

export interface SkillChipProps {
  skill: ProfileSkill;
  showCategory?: boolean;
  editable?: boolean;
  editing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

type VisualState = 'self-declared' | 'endorsed' | 'activity-backed';

function getVisualState(skill: ProfileSkill): VisualState {
  if (skill.activityBacked) return 'activity-backed';
  if (skill.endorsed) return 'endorsed';
  return 'self-declared';
}

const TOOLTIP_TEXT: Record<Exclude<VisualState, 'self-declared'>, string> = {
  endorsed: "Confirmed by people who've worked with you",
  'activity-backed': 'Backed by verified activity',
};

export function SkillChip({
  skill,
  showCategory,
  editable,
  editing,
  onEdit,
  onDelete,
}: SkillChipProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const tooltipId = useId();
  const state = getVisualState(skill);
  const hasTooltip = state !== 'self-declared';

  const showTooltip = useCallback(() => {
    if (hasTooltip) setTooltipVisible(true);
  }, [hasTooltip]);

  const hideTooltip = useCallback(() => {
    setTooltipVisible(false);
  }, []);

  const isClickable = editable && !editing;

  const handleClick = isClickable ? onEdit : undefined;
  const handleKeyDown = isClickable
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit?.();
        }
      }
    : undefined;

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- mouse hover for tooltip; keyboard access is on the focusable Badge */
    <span
      className="relative inline-flex"
      data-skill-chip=""
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <Badge
        variant="secondary"
        className={
          isClickable ? 'cursor-pointer transition-colors hover:bg-secondary/80' : undefined
        }
        onClick={handleClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={hasTooltip || isClickable ? 0 : undefined}
        onKeyDown={handleKeyDown}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={hasTooltip ? tooltipId : undefined}
      >
        {showCategory && skill.category && (
          <span className="mr-1 text-muted-foreground">{skill.category}:</span>
        )}
        {skill.skillName}
        {state === 'endorsed' && (
          <CheckCircle
            className="ml-1 h-3 w-3 text-muted-foreground"
            weight="fill"
            aria-hidden="true"
            data-testid="endorsed-icon"
          />
        )}
        {state === 'activity-backed' && (
          <Lightning
            className="ml-1 h-3 w-3 text-muted-foreground"
            weight="fill"
            aria-hidden="true"
            data-testid="activity-backed-icon"
          />
        )}
        {editing && onDelete && (
          <button
            type="button"
            className="ml-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label={`Remove ${skill.skillName}`}
          >
            <X className="h-3 w-3" weight="bold" aria-hidden="true" />
          </button>
        )}
      </Badge>
      {hasTooltip && tooltipVisible && (
        <span
          id={tooltipId}
          role="tooltip"
          aria-label={TOOLTIP_TEXT[state as Exclude<VisualState, 'self-declared'>]}
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
        >
          {TOOLTIP_TEXT[state as Exclude<VisualState, 'self-declared'>]}
        </span>
      )}
    </span>
  );
}
