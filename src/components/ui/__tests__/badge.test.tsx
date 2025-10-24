import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge Component', () => {
  it('should render badge with text', () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('should render default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild).toHaveClass('bg-primary');
  });

  it('should render secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(container.firstChild).toHaveClass('bg-secondary');
  });

  it('should render destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Destructive</Badge>);
    expect(container.firstChild).toHaveClass('bg-destructive');
  });

  it('should render outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    expect(container.firstChild).toHaveClass('border-input');
  });

  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom-class">Text</Badge>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render as inline element', () => {
    const { container } = render(<Badge>Inline</Badge>);
    expect(container.firstChild).toHaveClass('inline-flex');
  });

  it('should have proper typography', () => {
    const { container } = render(<Badge>Typography</Badge>);
    expect(container.firstChild).toHaveClass('text-xs', 'font-semibold');
  });

  it('should have rounded corners', () => {
    const { container } = render(<Badge>Rounded</Badge>);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('should handle multiple children', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
