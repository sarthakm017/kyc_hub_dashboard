jest.mock('axios');
jest.mock('antd', () => {
    const actual = jest.requireActual('antd');
    return {
      __esModule: true,
      ...actual,
      message: {
        success: jest.fn(),
        error:   jest.fn(),
        info:    jest.fn(),
        warning: jest.fn(),
        open:    jest.fn(),
      }
    };
  });
  jest.mock('../../services/api');
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import api from '../../services/api';
import { ConfigProvider, theme } from 'antd';

const mockMetrics = { success: true, data: { totalCustomers: 2, avgRiskScore: 50, totalIncome: 10000, totalExpenses: 4000 } };
const mockTrends  = { success: true, data: [{ date: '2025-04-01', income: 5000, expenses: 2000 }] };
const mockRiskDist= { success: true, data: [{ range: '0-25', count: 1 }] };
const mockKycs    = { success: true, data: [
  { _id: '1', fullName: 'Alice', idNumber: 'A1', riskScore: 60 },
  { _id: '2', fullName: 'Bob',   idNumber: 'B2', riskScore: 40 }
]};

const renderWithAntd = ui =>
  render(
    <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
      {ui}
    </ConfigProvider>
  );

describe('Dashboard', () => {
  beforeEach(() => {
    api.get.mockImplementation(url => {
      if (url.endsWith('/dashboard/metrics'))          return Promise.resolve({ data: mockMetrics });
      if (url.endsWith('/dashboard/trends'))           return Promise.resolve({ data: mockTrends });
      if (url.endsWith('/dashboard/risk-distribution'))return Promise.resolve({ data: mockRiskDist });
      if (url.endsWith('/kyc'))                        return Promise.resolve({ data: mockKycs });
      return Promise.resolve({ data: { success: false, data: [] } });
    });
    api.delete.mockResolvedValue({ data: { success: true } });
  });

  it('loads and displays metrics', async () => {
    renderWithAntd(<Dashboard onDataChange={jest.fn()} />);
    expect(await screen.findByText('Total Customers')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Avg. Risk Score')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('opens the modal when Add KYC clicked', async () => {
    renderWithAntd(<Dashboard onDataChange={jest.fn()} />);
    const btn = await screen.findByRole('button', { name: /add kyc/i });
    fireEvent.click(btn);
    expect(screen.getByText('New KYC Entry')).toBeVisible();
  });

  it('deletes a row and calls onDataChange', async () => {
    const bump = jest.fn();
    renderWithAntd(<Dashboard onDataChange={bump} />);
    await screen.findByText('Alice');
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^yes$/i }));
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/kyc/1'));
    expect(bump).toHaveBeenCalled();
  });

  it('shows Empty when no data', async () => {
    api.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
    renderWithAntd(<Dashboard onDataChange={jest.fn()} />);
    expect(await screen.findByText('No KYC records')).toBeVisible();
  });
});


