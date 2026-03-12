import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('embed.js', function () {
  var initSifaEmbeds: () => Promise<void[]>;

  beforeEach(async function () {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.resetModules();

    const mod = await import('../../public/embed.js');
    initSifaEmbeds = mod.initSifaEmbeds;
  });

  it('replaces script tag with shadow DOM container containing profile card', async function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://sifa.id/embed.js');
    script.setAttribute('data-did', 'did:plc:test123');
    document.body.appendChild(script);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: function () {
        return Promise.resolve({
          did: 'did:plc:test123',
          handle: 'alice.bsky.social',
          displayName: 'Alice',
          headline: 'Engineer',
          avatar: null,
          location: 'Amsterdam',
          profileUrl: 'https://sifa.id/p/alice.bsky.social',
          trustStats: [],
          verifiedAccounts: [],
          openTo: [],
          claimed: true,
        });
      },
    });

    await initSifaEmbeds();

    var container = document.querySelector('.sifa-embed');
    expect(container).not.toBeNull();
    expect(container?.shadowRoot).not.toBeNull();
    var html = container?.shadowRoot?.innerHTML ?? '';
    expect(html).toContain('Alice');
    expect(html).toContain('alice.bsky.social');
    expect(html).toContain('sifa.id/p/alice.bsky.social');
  });

  it('uses data-handle when data-did is absent', async function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://sifa.id/embed.js');
    script.setAttribute('data-handle', 'bob.bsky.social');
    document.body.appendChild(script);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: function () {
        return Promise.resolve({
          did: 'did:plc:bob',
          handle: 'bob.bsky.social',
          displayName: 'Bob',
          profileUrl: 'https://sifa.id/p/bob.bsky.social',
          trustStats: [],
          verifiedAccounts: [],
          openTo: [],
          claimed: true,
        });
      },
    });

    await initSifaEmbeds();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/embed/bob.bsky.social/data'),
    );
  });

  it('shows error state when profile not found', async function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://sifa.id/embed.js');
    script.setAttribute('data-did', 'did:plc:invalid');
    document.body.appendChild(script);

    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    await initSifaEmbeds();

    var container = document.querySelector('.sifa-embed');
    var html = container?.shadowRoot?.innerHTML ?? '';
    expect(html).toContain('Profile not found');
  });

  it('renders trust stats', async function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://sifa.id/embed.js');
    script.setAttribute('data-did', 'did:plc:test');
    document.body.appendChild(script);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: function () {
        return Promise.resolve({
          did: 'did:plc:test',
          handle: 'test',
          displayName: 'Test',
          profileUrl: 'https://sifa.id/p/test',
          trustStats: [
            { key: 'connections', label: 'Connections', value: 42 },
            { key: 'endorsements', label: 'Endorsements', value: 7 },
          ],
          verifiedAccounts: [],
          openTo: [],
          claimed: true,
        });
      },
    });

    await initSifaEmbeds();

    var html =
      document.querySelector('.sifa-embed')?.shadowRoot?.innerHTML ?? '';
    expect(html).toContain('42');
    expect(html).toContain('Connections');
  });

  it('renders open-to pills', async function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://sifa.id/embed.js');
    script.setAttribute('data-did', 'did:plc:test');
    document.body.appendChild(script);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: function () {
        return Promise.resolve({
          did: 'did:plc:test',
          handle: 'test',
          displayName: 'Test',
          profileUrl: 'https://sifa.id/p/test',
          trustStats: [],
          verifiedAccounts: [],
          openTo: ['Mentoring', 'Speaking'],
          claimed: true,
        });
      },
    });

    await initSifaEmbeds();

    var html =
      document.querySelector('.sifa-embed')?.shadowRoot?.innerHTML ?? '';
    expect(html).toContain('Mentoring');
    expect(html).toContain('Speaking');
  });

  it('applies dark theme styles', async function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://sifa.id/embed.js');
    script.setAttribute('data-did', 'did:plc:test');
    script.setAttribute('data-theme', 'dark');
    document.body.appendChild(script);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: function () {
        return Promise.resolve({
          did: 'did:plc:test',
          handle: 'test',
          displayName: 'Test',
          profileUrl: 'https://sifa.id/p/test',
          trustStats: [],
          verifiedAccounts: [],
          openTo: [],
          claimed: true,
        });
      },
    });

    await initSifaEmbeds();

    var style =
      document.querySelector('.sifa-embed')?.shadowRoot?.querySelector('style')
        ?.textContent ?? '';
    expect(style).toContain('#1a1a2e');
  });

  it('renders avatar image when avatar URL is provided', async function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://sifa.id/embed.js');
    script.setAttribute('data-did', 'did:plc:test');
    document.body.appendChild(script);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: function () {
        return Promise.resolve({
          did: 'did:plc:test',
          handle: 'test',
          displayName: 'Test User',
          avatar: 'https://cdn.example.com/avatar.jpg',
          profileUrl: 'https://sifa.id/p/test',
          trustStats: [],
          verifiedAccounts: [],
          openTo: [],
          claimed: true,
        });
      },
    });

    await initSifaEmbeds();

    var html =
      document.querySelector('.sifa-embed')?.shadowRoot?.innerHTML ?? '';
    expect(html).toContain('avatar.jpg');
    expect(html).toContain('<img');
  });

  it('renders letter placeholder when no avatar', async function () {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://sifa.id/embed.js');
    script.setAttribute('data-did', 'did:plc:test');
    document.body.appendChild(script);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: function () {
        return Promise.resolve({
          did: 'did:plc:test',
          handle: 'test',
          displayName: 'Alice',
          avatar: null,
          profileUrl: 'https://sifa.id/p/test',
          trustStats: [],
          verifiedAccounts: [],
          openTo: [],
          claimed: true,
        });
      },
    });

    await initSifaEmbeds();

    var html =
      document.querySelector('.sifa-embed')?.shadowRoot?.innerHTML ?? '';
    expect(html).toContain('avatar-placeholder');
    expect(html).toContain('A');
  });
});
