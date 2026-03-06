import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PostGigForm } from '../../../src/components/company/PostGigForm';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js image
vi.mock('next/image', () => ({
    default: () => {
        return 'Next image stub'; // Whatever your component needs
    },
}));

describe('PostGigForm', () => {
    const mockOnSubmit = vi.fn();
    const mockOnCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should show validation errors if title is empty or pay_amount is negative', async () => {
        render(
            <PostGigForm
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />
        );

        // Fill out form with invalid data
        const titleInput = screen.getByPlaceholderText('e.g. Install Office Network');
        const payAmountInput = screen.getByLabelText('Pay Amount ($)');

        // Clear title and set negative pay amount
        fireEvent.change(titleInput, { target: { value: '' } });
        fireEvent.change(payAmountInput, { target: { value: '-50' } });

        const submitButton = screen.getByRole('button', { name: 'Post Gig' });
        fireEvent.click(submitButton);

        // Wait for validation errors to appear
        await waitFor(() => {
            // These error messages depend on your zod schema, mocking general expected behavior
            expect(screen.queryByText(/String must contain at least/i) || screen.queryAllByText(/Required/i).length > 0).toBeTruthy();
            expect(screen.queryByText(/Number must be greater than/i) || screen.queryByText(/Expected number/i) || screen.queryByText(/Invalid pay amount/i)).toBeTruthy();
        });

        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should call onSubmit successfully when valid data is provided', async () => {
        render(
            <PostGigForm
                onSubmit={mockOnSubmit}
                onCancel={mockOnCancel}
                isLoading={false}
            />
        );

        // Fill out valid data
        fireEvent.change(screen.getByPlaceholderText('e.g. Install Office Network'), { target: { value: 'Valid Title' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. Networking'), { target: { value: 'Category' } });
        fireEvent.change(screen.getByPlaceholderText('e.g. 123 Main St, Remote'), { target: { value: '123 Main St' } });
        fireEvent.change(screen.getByLabelText('Pay Amount ($)'), { target: { value: '100' } });
        fireEvent.change(screen.getByLabelText('Schedule Date/Time'), { target: { value: '2026-10-10T10:00' } });
        fireEvent.change(screen.getByPlaceholderText('Describe the job requirements...'), { target: { value: 'Test description' } });

        const submitButton = screen.getByRole('button', { name: 'Post Gig' });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledTimes(1);
            expect(mockOnSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Valid Title',
                    pay_amount: 100,
                }),
                expect.anything()
            );
        });
    });
});
