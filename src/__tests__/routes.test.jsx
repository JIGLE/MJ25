import React from 'react';
import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';

describe('Additional routes', () => {
  it('renders gallery route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/gallery"]}>
        <App />
      </MemoryRouter>
    );

    // Gallery page has an H1 with the section title; scope query to this render
    const galleryHeading = within(container).getByRole('heading', { level: 1 });
    expect(galleryHeading.textContent.toLowerCase()).toContain('gallery');
  });

  it('renders guests route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/guests"]}>
        <App />
      </MemoryRouter>
    );

    const guestsHeading = within(container).getByRole('heading', { level: 1 });
    expect(guestsHeading.textContent.toLowerCase()).toContain('guests');
  });
});
