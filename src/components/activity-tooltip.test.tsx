import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { ActivityTooltip } from './activity-tooltip';

describe('ActivityTooltip', () => {
  it('shows tooltip on hover', async () => {
    render(
      <ActivityTooltip
        appName="Tangled"
        tooltipDescription="Git hosting on the AT Protocol."
        appUrl="https://tangled.sh"
      >
        <button>Tangled</button>
      </ActivityTooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toContain('Git hosting on the AT Protocol.');
  });

  it('shows network note for shared namespaces', async () => {
    render(
      <ActivityTooltip
        appName="Bluesky network"
        tooltipDescription="Social networking on the AT Protocol."
        tooltipNetworkNote="Posted using a Bluesky-compatible app. The specific client is unknown."
        appUrl="https://bsky.app"
      >
        <button>Bluesky network</button>
      </ActivityTooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toContain('Social networking on the AT Protocol.');
    expect(tooltip.textContent).toContain('The specific client is unknown.');
  });

  it('shows outbound link when appUrl provided', async () => {
    render(
      <ActivityTooltip
        appName="Tangled"
        tooltipDescription="Git hosting on the AT Protocol."
        appUrl="https://tangled.sh"
      >
        <button>Tangled</button>
      </ActivityTooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://tangled.sh');
  });

  it('omits link when no appUrl', async () => {
    render(
      <ActivityTooltip
        appName="AT Protocol"
        tooltipDescription="Activity from an AT Protocol app that Sifa doesn't recognize yet."
      >
        <button>AT Protocol</button>
      </ActivityTooltip>,
    );
    await userEvent.hover(screen.getByRole('button'));
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('hides tooltip on mouse leave', async () => {
    render(
      <ActivityTooltip appName="Tangled" tooltipDescription="Git hosting on the AT Protocol.">
        <button>Tangled</button>
      </ActivityTooltip>,
    );
    const user = userEvent.setup();
    await user.hover(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeDefined();
    await user.unhover(screen.getByRole('button'));
    // Wait for the 150ms delay
    await new Promise((r) => setTimeout(r, 200));
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
