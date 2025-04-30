jest.mock('axios');
jest.mock('antd');
jest.mock('../../services/api');
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KycForm from '../KycForm';
import api from '../../services/api';

describe('KycForm', () => {
  const existingIds = ['EXIST123'];

  it('renders all fields', () => {
    render(<KycForm existingIds={existingIds} onSuccess={jest.fn()} />);
    [
      'Full Name',
      'Date of Birth',
      'ID Number',
      'Selfie URL',
      'Credit Score',
      'Monthly Income',
      'Outstanding Loans',
      'Repayment History'
    ].forEach(label => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it('blocks duplicate ID Numbers', async () => {
    render(<KycForm existingIds={existingIds} onSuccess={jest.fn()} />);
    const idInput = screen.getByLabelText('ID Number');
    fireEvent.change(idInput, { target: { value: 'EXIST123' } });
    fireEvent.blur(idInput);
    expect(await screen.findByText('This ID Number already exists')).toBeVisible();
  });

  it('submits valid data and calls onSuccess', async () => {
    const mockSuccess = jest.fn();
    api.post.mockResolvedValue({ data: { success: true } });

    render(<KycForm existingIds={[]} onSuccess={mockSuccess} />);
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('ID Number'),   { target: { value: 'ID100' } });
    fireEvent.change(screen.getByLabelText('Selfie URL'),   { target: { value: 'http://img.jpg' } });
    fireEvent.change(screen.getByLabelText('Credit Score (300–850)'), { target: { value: 700 } });
    fireEvent.change(screen.getByLabelText('Monthly Income'),       { target: { value: 5000 } });
    fireEvent.change(screen.getByLabelText('Outstanding Loans'),    { target: { value: 1000 } });
    fireEvent.change(
      screen.getByLabelText('Repayment History (comma-sep 1=paid,0=missed)'),
      { target: { value: '1,0,1,1' } }
    );
    fireEvent.change(screen.getByLabelText('Date of Birth'), { target: { value: '2025-01-01' } });

    fireEvent.click(screen.getByRole('button', { name: /submit kyc/i }));
    await waitFor(() => expect(api.post).toHaveBeenCalled());
    expect(mockSuccess).toHaveBeenCalled();
  });
});

