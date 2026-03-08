import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home', () => {
  it('renders heading', () => {
    render(<Home />);
    expect(screen.getByText('Sifa')).toBeDefined();
  });
});
