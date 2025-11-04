import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SurveyJsBuilder } from '@/components/admin/questions/SurveyJsBuilder';

// Expose a save mock we can assert on
export const saveMock = jest.fn();

jest.mock('survey-creator-react', () => {
  class SurveyCreator {
    JSON: any;
    showToolbox = true;
    showPropertyGrid = true;
    constructor(_opts: any) {
      this.JSON = {
        title: 'Mock Survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text', name: 'q1', title: 'Q1' }
            ]
          }
        ]
      };
    }
  }
  const SurveyCreatorComponent = ({ creator }: any) => (
    <div data-testid="creator" data-has-json={!!creator?.JSON} />
  );
  return { SurveyCreator, SurveyCreatorComponent };
});

jest.mock('@/hooks/useSurveyJsSync', () => ({
  useSurveyJsSync: () => ({ save: saveMock, isSaving: false })
}));

describe('SurveyJsBuilder', () => {
  const categories = [
    { id: 'cat1', name: 'General', display_name: 'General', questions: [] }
  ];

  beforeEach(() => {
    saveMock.mockReset();
  });

  it('renders the builder header and stubbed creator', () => {
    const onClose = jest.fn();
    render(<SurveyJsBuilder level={1} categories={categories as any} onClose={onClose} />);

    expect(screen.getByText(/Visual Question Builder - Level 1/i)).toBeInTheDocument();
    expect(screen.getByTestId('creator')).toBeInTheDocument();
  });

  it('saves and closes when clicking Save to Database', async () => {
    const onClose = jest.fn();
    render(<SurveyJsBuilder level={1} categories={categories as any} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /save to database/i }));

    await waitFor(() => {
      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
      const firstArg = saveMock.mock.calls[0][0];
      expect(Array.isArray(firstArg)).toBe(true);
      expect(firstArg.length).toBeGreaterThan(0);
    });
  });
});
