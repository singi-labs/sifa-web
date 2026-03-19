import { BoldPlugin, ItalicPlugin } from '@platejs/basic-nodes/react';
import { IndentPlugin } from '@platejs/indent/react';
import { LinkPlugin } from '@platejs/link/react';
import { ListPlugin } from '@platejs/list/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { ParagraphPlugin } from 'platejs/react';

export const markdownEditorPlugins = [
  BoldPlugin,
  ItalicPlugin,
  LinkPlugin,
  IndentPlugin.configure({
    inject: {
      targetPlugins: [ParagraphPlugin.key],
    },
  }),
  ListPlugin.configure({
    inject: {
      targetPlugins: [ParagraphPlugin.key],
    },
  }),
  MarkdownPlugin,
];
