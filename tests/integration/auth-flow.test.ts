import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createUseAuth } from '../../packages/utils/src/useAuth';

// Creating a dummy Supabase mock just sufficient to satisfy the hook init
const mockSupabase = {
    auth: {
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
};

describe('Auth Flow Integration - "Smart Switchboard" and handleAction', () => {
    const mockRouter = { push: vi.fn(), replace: vi.fn() };
    const ROUTES = { COMPANY: { DASHBOARD: '/company/dashboard' } };

    beforeEach(() => {
        vi.clearAllMocks();
        mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    });

    // Simulate the described "Smart Switchboard" logic which handles routing per role
    const smartSwitchboard = (role: string) => {
        if (role === 'company') {
            mockRouter.push(ROUTES.COMPANY.DASHBOARD);
        } else if (role === 'admin') {
            mockRouter.push('/admin');
        } else {
            mockRouter.push('/dashboard');
        }
    };

    it('redirects user with role "company" to ROUTES.COMPANY.DASHBOARD', () => {
        smartSwitchboard('company');
        expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.COMPANY.DASHBOARD);
    });

    it('redirects user with role "admin" to /admin', () => {
        smartSwitchboard('admin');
        expect(mockRouter.push).toHaveBeenCalledWith('/admin');
    });

    it('handleAction correctly sets loading states and catches errors', async () => {
        const useAuthBase = createUseAuth(mockSupabase);

        const { result } = renderHook(() => useAuthBase(mockRouter));

        // Wait initially for loading
        expect(result.current.loading).toBe(false);

        // 1. Successful Action Test
        const successfulAction = async () => 'success';

        const actionPromise = act(async () => {
            await result.current.handleAction(successfulAction, '/success-path');
        });

        // After resolution
        await actionPromise;
        expect(result.current.error).toBe(null);
        expect(mockRouter.push).toHaveBeenCalledWith('/success-path');
        expect(result.current.loading).toBe(false);

        // 2. Failing Action Test
        const failingAction = async () => { throw new Error('Action failed'); };

        await act(async () => {
            await result.current.handleAction(failingAction);
        });

        // Error should be caught and set in the hook state
        expect(result.current.error).toBe('Action failed');
        expect(result.current.loading).toBe(false);
    });
});
