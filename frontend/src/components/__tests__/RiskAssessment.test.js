jest.mock('axios');
jest.mock('antd');
jest.mock('../../services/api');  // mock the api import
import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskAssessment, { computeRiskScore } from '../RiskAssessment';
import api from '../../services/api';
import { ConfigProvider, theme } from 'antd';

describe('computeRiskScore', () => {
  it('returns 0 for perfect profile', () => {
    const customer = {
      creditScore: 850,
      loanRepaymentHistory: [1,1,1],
      monthlyIncome: 1000,
      outstandingLoans: 0
    };
    expect(computeRiskScore(customer)).toBe(0);
  });

  it('returns high value for bad profile', () => {
    const customer = {
      creditScore: 300,
      loanRepaymentHistory: [0,0,0],
      monthlyIncome: 1000,
      outstandingLoans: 20000
    };
    expect(computeRiskScore(customer)).toBeGreaterThan(80);
  });
});

describe('RiskAssessment component', () => {
  const mockData = {
    success: true,
    data: [
      {
        fullName: 'Test User',
        creditScore: 700,
        loanRepaymentHistory: [1,0,1],
        monthlyIncome: 1000,
        outstandingLoans: 1000
      }
    ]
  };

  beforeEach(() => {
    api.get.mockResolvedValue(mockData);
  });

  it('renders a row for each customer', async () => {
    render(
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <RiskAssessment />
      </ConfigProvider>
    );

    // the name cell should appear
    expect(await screen.findByText('Test User')).toBeInTheDocument();

    // and the computed progress percentage
    const score = computeRiskScore(mockData.data[0]);
    expect(screen.getByText(`${score}%`)).toBeInTheDocument();
  });
});
