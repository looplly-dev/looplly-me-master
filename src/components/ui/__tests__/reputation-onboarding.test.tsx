import { render, screen, fireEvent } from '@testing-library/react';
import { ReputationOnboarding } from '../reputation-onboarding';

describe('ReputationOnboarding', () => {
  it('should render onboarding dialog when open', () => {
    const mockClose = jest.fn();
    render(
      <ReputationOnboarding
        open={true}
        onClose={mockClose}
        isBetaCohort={true}
        betaRepCap={1000}
      />
    );

    expect(screen.getByText('Welcome to Reputation System')).toBeInTheDocument();
    expect(screen.getByText('Beta Member')).toBeInTheDocument();
  });

  it('should show Beta soft cap notice for Beta users', () => {
    const mockClose = jest.fn();
    render(
      <ReputationOnboarding
        open={true}
        onClose={mockClose}
        isBetaCohort={true}
        betaRepCap={1000}
      />
    );

    expect(screen.getByText(/soft cap at/i)).toBeInTheDocument();
    expect(screen.getByText(/1000 Rep/i)).toBeInTheDocument();
  });

  it('should NOT show Beta notice for non-Beta users', () => {
    const mockClose = jest.fn();
    render(
      <ReputationOnboarding
        open={true}
        onClose={mockClose}
        isBetaCohort={false}
        betaRepCap={1000}
      />
    );

    expect(screen.queryByText('Beta Member')).not.toBeInTheDocument();
  });

  it('should call onClose when button is clicked', () => {
    const mockClose = jest.fn();
    render(
      <ReputationOnboarding
        open={true}
        onClose={mockClose}
        isBetaCohort={false}
        betaRepCap={1000}
      />
    );

    const button = screen.getByText(/Got it!/i);
    fireEvent.click(button);

    expect(mockClose).toHaveBeenCalled();
  });

  it('should show all tier progression boxes', () => {
    const mockClose = jest.fn();
    render(
      <ReputationOnboarding
        open={true}
        onClose={mockClose}
        isBetaCohort={false}
        betaRepCap={1000}
      />
    );

    expect(screen.getByText('Bronze (0-99)')).toBeInTheDocument();
    expect(screen.getByText('Silver (100-249)')).toBeInTheDocument();
    expect(screen.getByText('Gold (250-499)')).toBeInTheDocument();
    expect(screen.getByText('Platinum (500-999)')).toBeInTheDocument();
    expect(screen.getByText('Diamond (1000-1999)')).toBeInTheDocument();
    expect(screen.getByText('Elite (2000+)')).toBeInTheDocument();
  });

  it('should show how reputation works section', () => {
    const mockClose = jest.fn();
    render(
      <ReputationOnboarding
        open={true}
        onClose={mockClose}
        isBetaCohort={false}
        betaRepCap={1000}
      />
    );

    expect(screen.getByText('How Reputation Works:')).toBeInTheDocument();
    expect(screen.getByText(/Gain Rep:/i)).toBeInTheDocument();
    expect(screen.getByText(/Lose Rep:/i)).toBeInTheDocument();
    expect(screen.getByText(/Quality Metrics:/i)).toBeInTheDocument();
  });
});
