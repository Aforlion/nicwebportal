import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ChartNodeView } from '@/components/ui/chart-node-view';

export interface ChartOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    chart: {
      insertChart: (options: { type: string, data: any, title?: string }) => ReturnType;
    }
  }
}

export const ChartExtension = Node.create<ChartOptions>({
  name: 'chartComponent',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      type: {
        default: 'bar',
      },
      data: {
        default: [],
        parseHTML: element => {
            try {
                return JSON.parse(element.getAttribute('data-data') || '[]')
            } catch {
                return []
            }
        },
        renderHTML: attributes => {
            return {
                'data-data': JSON.stringify(attributes.data)
            }
        }
      },
      title: {
        default: 'Chart',
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'chart-component',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['chart-component', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartNodeView);
  },

  addCommands() {
    return {
      insertChart: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});
