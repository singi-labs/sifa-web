'use client';

import { useCallback, useRef } from 'react';

import { MarkdownPlugin } from '@platejs/markdown';
import { Plate, PlateContent, usePlateEditor } from 'platejs/react';

import { markdownEditorPlugins } from '@/components/plate-editor/editor-plugins';
import { EditorToolbar } from '@/components/plate-editor/editor-toolbar';

interface PlateMarkdownEditorProps {
  id: string;
  value: string;
  onChange: (md: string) => void;
  placeholder?: string;
  'aria-label'?: string;
}

export function PlateMarkdownEditor({
  id,
  value,
  onChange,
  placeholder,
  'aria-label': ariaLabel,
}: PlateMarkdownEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const editor = usePlateEditor(
    {
      plugins: markdownEditorPlugins,
      value: (plateEditor) => plateEditor.getApi(MarkdownPlugin).markdown.deserialize(value),
    },
    [],
  );

  const handleValueChange = useCallback(
    ({ editor: plateEditor }: { editor: typeof editor }) => {
      if (debounceRef.current !== undefined) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        const md = plateEditor.getApi(MarkdownPlugin).markdown.serialize();
        onChange(md);
      }, 300);
    },
    [onChange],
  );

  return (
    <div className="rounded-md border border-border bg-background">
      <Plate editor={editor} onValueChange={handleValueChange}>
        <EditorToolbar />
        <PlateContent
          id={id}
          aria-label={ariaLabel}
          placeholder={placeholder}
          className="min-h-[120px] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_[data-slate-node=element]:not(:last-child)]:mb-4"
        />
      </Plate>
    </div>
  );
}
