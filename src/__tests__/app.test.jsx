import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from '../App.jsx';

describe('App basic routes', () => {
  it('renders the navbar and home route', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

  // Navbar should render
  const nav = screen.getByRole('navigation');
  expect(nav).toBeDefined();

  // Home hero title should be present (look for the specific text)
  const heroTitle = screen.getByText(/Marlene & Jose/i);
  expect(heroTitle).toBeDefined();
  });
});
