import { describe, it, expect } from 'vitest';
import { sanitizeHandleInput } from '../../src/lib/handle-utils';

describe('sanitizeHandleInput', () => {
  it('passes through a full handle unchanged', () => {
    expect(sanitizeHandleInput('jay.bsky.social')).toBe('jay.bsky.social');
  });

  it('passes through a custom domain handle', () => {
    expect(sanitizeHandleInput('alice.custom-pds.example')).toBe('alice.custom-pds.example');
  });

  it('passes through a DID unchanged', () => {
    expect(sanitizeHandleInput('did:plc:abc123')).toBe('did:plc:abc123');
  });

  it('appends .bsky.social to bare usernames', () => {
    expect(sanitizeHandleInput('jeroenwaelen')).toBe('jeroenwaelen.bsky.social');
  });

  it('strips https:// URL prefix from PDS domains', () => {
    expect(sanitizeHandleInput('https://jeroenwaelen.bsky.social')).toBe(
      'jeroenwaelen.bsky.social',
    );
  });

  it('strips http:// URL prefix', () => {
    expect(sanitizeHandleInput('http://alice.custom-pds.example')).toBe('alice.custom-pds.example');
  });

  it('strips Bluesky profile URL', () => {
    expect(sanitizeHandleInput('https://bsky.app/profile/jay.bsky.social')).toBe('jay.bsky.social');
  });

  it('strips at:// URI', () => {
    expect(sanitizeHandleInput('at://jay.bsky.social')).toBe('jay.bsky.social');
  });

  it('strips @ prefix', () => {
    expect(sanitizeHandleInput('@jay.bsky.social')).toBe('jay.bsky.social');
  });

  it('strips trailing dot', () => {
    expect(sanitizeHandleInput('jay.bsky.social.')).toBe('jay.bsky.social');
  });

  it('lowercases handles', () => {
    expect(sanitizeHandleInput('Jay.Bsky.Social')).toBe('jay.bsky.social');
  });

  it('preserves DID case', () => {
    expect(sanitizeHandleInput('did:plc:AbCdEf')).toBe('did:plc:AbCdEf');
  });

  it('strips trailing path segments from URLs', () => {
    expect(sanitizeHandleInput('https://jeroenwaelen.bsky.social/some/path')).toBe(
      'jeroenwaelen.bsky.social',
    );
  });

  it('trims whitespace', () => {
    expect(sanitizeHandleInput('  jay.bsky.social  ')).toBe('jay.bsky.social');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeHandleInput('')).toBe('');
    expect(sanitizeHandleInput('   ')).toBe('');
  });
});
