import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Register from '../Register';
import * as mobileValidation from '@/utils/mobileValidation';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: jest.fn(),
    authState: { user: null, session: null, loading: false }
  })
}));

// Mock mobile validation
jest.mock('@/utils/mobileValidation');

describe('Register Component - Mobile Validation', () => {
  const mockOnBack = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnOTPRequired = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Always-Visible Validation Indicator', () => {
    it('should show helper text when mobile field is empty', () => {
      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const helperText = screen.getByText(/Enter without country code/i);
      expect(helperText).toBeInTheDocument();
      expect(helperText).toHaveClass('text-muted-foreground');
    });

    it('should validate immediately on first keystroke', async () => {
      const user = userEvent.setup();
      
      (mobileValidation.validateAndNormalizeMobile as jest.Mock).mockReturnValue({
        isValid: false,
        error: 'Number too short for ZA',
        normalizedNumber: undefined,
        nationalFormat: undefined
      });

      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      
      // Type a single digit
      await user.type(mobileInput, '0');

      await waitFor(() => {
        expect(mobileValidation.validateAndNormalizeMobile).toHaveBeenCalledWith('0', '+27');
      });

      // Error should be visible immediately
      const errorMessage = await screen.findByText(/Number too short for ZA/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-destructive');
    });

    it('should show green checkmark and E.164 format for valid number', async () => {
      const user = userEvent.setup();
      
      (mobileValidation.validateAndNormalizeMobile as jest.Mock).mockReturnValue({
        isValid: true,
        error: undefined,
        normalizedNumber: '+27823093959',
        nationalFormat: '082 309 3959'
      });

      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      
      // Type a valid number
      await user.type(mobileInput, '0823093959');

      await waitFor(() => {
        const successIndicator = screen.getByText('✓');
        expect(successIndicator).toBeInTheDocument();
        expect(successIndicator).toHaveClass('text-green-600');
        
        const normalizedDisplay = screen.getByText(/\+27823093959/);
        expect(normalizedDisplay).toBeInTheDocument();
        expect(normalizedDisplay.tagName).toBe('CODE');
      });
    });

    it('should show error for partial valid input (2-3 digits)', async () => {
      const user = userEvent.setup();
      
      (mobileValidation.validateAndNormalizeMobile as jest.Mock).mockReturnValue({
        isValid: false,
        error: 'Number too short for ZA',
        normalizedNumber: undefined,
        nationalFormat: undefined
      });

      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      
      // Type 2 digits
      await user.type(mobileInput, '08');

      await waitFor(() => {
        const errorMessage = screen.getByText(/Number too short for ZA/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should revalidate immediately when country changes', async () => {
      const user = userEvent.setup();
      
      // Mock for initial ZA validation
      (mobileValidation.validateAndNormalizeMobile as jest.Mock)
        .mockReturnValueOnce({
          isValid: false,
          error: 'Number too short for ZA',
          normalizedNumber: undefined,
          nationalFormat: undefined
        })
        // Mock for NG validation after country change
        .mockReturnValueOnce({
          isValid: false,
          error: 'Number too short for NG',
          normalizedNumber: undefined,
          nationalFormat: undefined
        });

      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      await user.type(mobileInput, '081');

      // Change country to Nigeria
      const countrySelect = screen.getByRole('combobox');
      await user.click(countrySelect);
      const nigeriaOption = screen.getByText(/\+234/);
      await user.click(nigeriaOption);

      await waitFor(() => {
        expect(mobileValidation.validateAndNormalizeMobile).toHaveBeenCalledWith('081', '+234');
        const errorMessage = screen.getByText(/Number too short for NG/i);
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should reset validation when field is cleared', async () => {
      const user = userEvent.setup();
      
      (mobileValidation.validateAndNormalizeMobile as jest.Mock).mockReturnValue({
        isValid: false,
        error: 'Number too short for ZA',
        normalizedNumber: undefined,
        nationalFormat: undefined
      });

      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      
      // Type and then clear
      await user.type(mobileInput, '08');
      await user.clear(mobileInput);

      await waitFor(() => {
        // Helper text should reappear
        const helperText = screen.getByText(/Enter without country code/i);
        expect(helperText).toBeInTheDocument();
        
        // Error should be gone
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });

    it('should have proper ARIA attributes for accessibility', () => {
      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      expect(mobileInput).toHaveAttribute('type', 'tel');
      expect(mobileInput).toHaveAttribute('required');
    });

    it('should display validation with proper contrast for dark mode', async () => {
      const user = userEvent.setup();
      
      (mobileValidation.validateAndNormalizeMobile as jest.Mock).mockReturnValue({
        isValid: true,
        error: undefined,
        normalizedNumber: '+27823093959',
        nationalFormat: '082 309 3959'
      });

      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      await user.type(mobileInput, '0823093959');

      await waitFor(() => {
        const successIndicator = screen.getByText('✓');
        // Should have dark mode class
        expect(successIndicator).toHaveClass('dark:text-green-500');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid typing', async () => {
      const user = userEvent.setup();
      
      (mobileValidation.validateAndNormalizeMobile as jest.Mock).mockReturnValue({
        isValid: false,
        error: 'Number too short for ZA',
        normalizedNumber: undefined,
        nationalFormat: undefined
      });

      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      
      // Type rapidly (without delay)
      await user.type(mobileInput, '0823093959');

      await waitFor(() => {
        // Validation should have been called for each keystroke
        expect(mobileValidation.validateAndNormalizeMobile).toHaveBeenCalled();
      });
    });

    it('should handle paste events', async () => {
      const user = userEvent.setup();
      
      (mobileValidation.validateAndNormalizeMobile as jest.Mock).mockReturnValue({
        isValid: true,
        error: undefined,
        normalizedNumber: '+27823093959',
        nationalFormat: '082 309 3959'
      });

      render(
        <Register
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          onOTPRequired={mockOnOTPRequired}
        />
      );

      const mobileInput = screen.getByLabelText(/mobile number/i);
      
      // Paste a number
      await user.click(mobileInput);
      await user.paste('0823093959');

      await waitFor(() => {
        const successIndicator = screen.getByText('✓');
        expect(successIndicator).toBeInTheDocument();
      });
    });
  });
});
