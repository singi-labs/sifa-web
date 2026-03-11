import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportItemList } from '@/app/import/components/import-item-list';

interface TestItem {
  name: string;
  detail?: string;
}

describe('ImportItemList', () => {
  const items: TestItem[] = [{ name: 'Item A', detail: 'Detail A' }, { name: 'Item B' }];

  it('renders items with labels and details', () => {
    render(
      <ImportItemList
        items={items}
        labelFn={(item) => item.name}
        detailFn={(item) => item.detail}
        emptyMessage="None"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByText('Item A')).toBeDefined();
    expect(screen.getByText('Detail A')).toBeDefined();
    expect(screen.getByText('Item B')).toBeDefined();
  });

  it('renders empty message when no items', () => {
    render(
      <ImportItemList<TestItem>
        items={[]}
        labelFn={(item) => item.name}
        emptyMessage="Nothing here"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByText('Nothing here')).toBeDefined();
  });

  it('calls onRemove with correct index', async () => {
    const onRemove = vi.fn();
    render(
      <ImportItemList
        items={items}
        labelFn={(item) => item.name}
        emptyMessage="None"
        onRemove={onRemove}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /remove item a/i }));
    expect(onRemove).toHaveBeenCalledWith(0);
  });

  it('has accessible remove buttons with aria-label', () => {
    render(
      <ImportItemList
        items={items}
        labelFn={(item) => item.name}
        emptyMessage="None"
        onRemove={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /remove item a/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /remove item b/i })).toBeDefined();
  });
});
