import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import DashboardPage from './pages/DashboardPage';
import ConnectorDetailPage from './pages/ConnectorDetailPage';
import { AppProvider } from './providers/AppProvider';

describe('App routing', () => {
  it('renders DashboardPage at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppProvider>
          <DashboardPage />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Integrations')).toBeInTheDocument();
  });

  it('renders ConnectorDetailPage at /connector/:id', () => {
    render(
      <MemoryRouter initialEntries={['/connector/abc']}>
        <AppProvider>
          <ConnectorDetailPage />
        </AppProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Automation Not Found')).toBeInTheDocument();
  });
});
