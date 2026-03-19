'use client';

import { useCallback, useRef, type KeyboardEvent } from 'react';

import type { Icon } from '@phosphor-icons/react';
import {
  Link as LinkIcon,
  ListBullets,
  ListNumbers,
  TextB,
  TextItalic,
} from '@phosphor-icons/react';
import { someList, toggleList } from '@platejs/list';
import { triggerFloatingLink } from '@platejs/link/react';
import { useEditorRef, useEditorSelector } from 'platejs/react';
import { KEYS } from 'platejs';

import { cn } from '@/lib/utils';

interface ToolbarButtonProps {
  'aria-label': string;
  icon: Icon;
  pressed: boolean;
  onClick: () => void;
  tabIndex: number;
}

function ToolbarButton({
  'aria-label': ariaLabel,
  icon: Icon,
  pressed,
  onClick,
  tabIndex,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      role="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      tabIndex={tabIndex}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        pressed && 'bg-accent text-accent-foreground',
      )}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={onClick}
    >
      <Icon size={18} />
    </button>
  );
}

export function EditorToolbar() {
  const editor = useEditorRef();
  const toolbarRef = useRef<HTMLDivElement>(null);

  const isBoldActive = useEditorSelector((ed) => !!ed.api.marks()?.bold, []);
  const isItalicActive = useEditorSelector((ed) => !!ed.api.marks()?.italic, []);
  const isLinkActive = useEditorSelector(
    (ed) => !!ed.api.node({ match: { type: ed.getType(KEYS.link) } }),
    [],
  );
  const isBulletListActive = useEditorSelector((ed) => someList(ed, KEYS.ul), []);
  const isNumberedListActive = useEditorSelector((ed) => someList(ed, KEYS.ol), []);

  const buttons = [
    {
      'aria-label': 'Bold',
      icon: TextB,
      pressed: isBoldActive,
      onClick: () => {
        editor.tf.toggleMark(KEYS.bold);
        editor.tf.focus();
      },
      group: 'marks',
    },
    {
      'aria-label': 'Italic',
      icon: TextItalic,
      pressed: isItalicActive,
      onClick: () => {
        editor.tf.toggleMark(KEYS.italic);
        editor.tf.focus();
      },
      group: 'marks',
    },
    {
      'aria-label': 'Link',
      icon: LinkIcon,
      pressed: isLinkActive,
      onClick: () => {
        triggerFloatingLink(editor, { focused: true });
      },
      group: 'marks',
    },
    {
      'aria-label': 'Bullet list',
      icon: ListBullets,
      pressed: isBulletListActive,
      onClick: () => {
        toggleList(editor, { listStyleType: KEYS.ul });
        editor.tf.focus();
      },
      group: 'lists',
    },
    {
      'aria-label': 'Numbered list',
      icon: ListNumbers,
      pressed: isNumberedListActive,
      onClick: () => {
        toggleList(editor, { listStyleType: KEYS.ol });
        editor.tf.focus();
      },
      group: 'lists',
    },
  ];

  const focusedIndexRef = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const focusableButtons = toolbar.querySelectorAll<HTMLButtonElement>('button:not([disabled])');
    const count = focusableButtons.length;
    if (count === 0) return;

    let nextIndex = focusedIndexRef.current;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (focusedIndexRef.current + 1) % count;
        e.preventDefault();
        break;
      case 'ArrowLeft':
        nextIndex = (focusedIndexRef.current - 1 + count) % count;
        e.preventDefault();
        break;
      case 'Home':
        nextIndex = 0;
        e.preventDefault();
        break;
      case 'End':
        nextIndex = count - 1;
        e.preventDefault();
        break;
      default:
        return;
    }

    focusedIndexRef.current = nextIndex;
    focusableButtons[nextIndex]?.focus();
  }, []);

  const separatorIndex = buttons.findIndex((b) => b.group === 'lists');

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      aria-orientation="horizontal"
      aria-label="Text formatting"
      className="flex items-center gap-0.5 border-b border-border px-1 py-1"
      onKeyDown={handleKeyDown}
    >
      {buttons.map((button, index) => (
        <span key={button['aria-label']} className="contents">
          {index === separatorIndex && (
            <div role="separator" aria-orientation="vertical" className="mx-1 h-5 w-px bg-border" />
          )}
          <ToolbarButton
            aria-label={button['aria-label']}
            icon={button.icon}
            pressed={button.pressed}
            onClick={button.onClick}
            tabIndex={index === focusedIndexRef.current ? 0 : -1}
          />
        </span>
      ))}
    </div>
  );
}
