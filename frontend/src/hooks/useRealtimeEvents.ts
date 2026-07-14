/**
 * useRealtimeEvents - Global WebSocket event handler
 *
 * Mounted once in App.tsx. Subscribes to:
 *  - /topic/notifications/{userId}  → user-specific events
 *  - /topic/admin-events            → admin broadcast events (ADMIN role only)
 *
 * Maps each event type → React Query cache invalidations.
 * Uses PREFIX-based invalidation (no exact IDs) to avoid type mismatches
 * between string params (useParams) and numeric referenceIds from backend.
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { useAuthStore } from '@/store/authStore';

export function useRealtimeEvents() {
  const { user } = useAuthStore();
  const { isConnected, subscribe } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isConnected || !user) return;

    // ── User-specific event channel ────────────────────────────────────────
    const userSub = subscribe(`/topic/notifications/${user.id}`, (event: any) => {
      const type: string = event?.type ?? '';

      // Skip pure notification saves (no eventOnly flag) — just refresh badge
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      switch (type) {
        // ── Wallet events ────────────────────────────────────────────────
        case 'WALLET_UPDATED':
        case 'PAYMENT_RECEIVED':
        case 'WITHDRAWAL':
        case 'WITHDRAWAL_APPROVED':
        case 'WITHDRAWAL_REJECTED':
        case 'DEPOSIT':
          queryClient.invalidateQueries({ queryKey: ['wallet'] });
          queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
          break;

        // ── Contract & Milestone events ───────────────────────────────────
        // NOTE: use prefix ['contract'] without ID to avoid string/number mismatch
        // (ContractPage uses string ID from useParams, backend sends numeric referenceId)
        case 'CONTRACT_UPDATED':
        case 'CONTRACT_COMPLETED':
        case 'MILESTONE_SUBMITTED':
        case 'MILESTONE_REJECTED':
        case 'MILESTONE_AUTO_APPROVED':
          queryClient.invalidateQueries({ queryKey: ['contract'] });    // matches all ['contract', id]
          queryClient.invalidateQueries({ queryKey: ['my-contracts'] });
          queryClient.invalidateQueries({ queryKey: ['contracts'] });
          if (type === 'CONTRACT_COMPLETED' || type === 'MILESTONE_AUTO_APPROVED') {
            queryClient.invalidateQueries({ queryKey: ['wallet'] });
          }
          break;

        // ── Proposal events ──────────────────────────────────────────────
        case 'PROPOSAL_RECEIVED':
        case 'PROPOSAL_ACCEPTED':
        case 'PROPOSAL_REJECTED':
          queryClient.invalidateQueries({ queryKey: ['proposals'] });   // matches all ['proposals', id]
          queryClient.invalidateQueries({ queryKey: ['my-proposals'] });
          queryClient.invalidateQueries({ queryKey: ['job'] });         // matches all ['job', id]
          break;

        // ── Job events ───────────────────────────────────────────────────
        case 'JOB_CREATED':
        case 'JOB_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['jobs'] });
          queryClient.invalidateQueries({ queryKey: ['my-jobs'] });
          break;

        // ── Admin withdraw event (expert gets notified via user channel)──
        case 'WITHDRAW_REQUEST':
          queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
          break;

        default:
          break;
      }
    });

    // ── Admin-only broadcast channel ───────────────────────────────────────
    let adminSub: ReturnType<typeof subscribe> = null;
    if (user.role === 'ADMIN') {
      adminSub = subscribe('/topic/admin-events', (event: any) => {
        const type: string = event?.type ?? '';

        switch (type) {
          case 'ESCROW_RELEASED':
          case 'CONTRACT_COMPLETED':
            queryClient.invalidateQueries({ queryKey: ['admin-escrows-all'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            break;

          case 'WITHDRAWAL_REQUESTED':
          case 'WITHDRAWAL_UPDATED':
            queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            break;

          case 'USER_UPDATED':
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            break;

          case 'SERVICE_UPDATED':
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
            break;

          default:
            // Generic admin refresh
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            break;
        }
      });
    }

    return () => {
      userSub?.unsubscribe();
      adminSub?.unsubscribe();
    };
  }, [isConnected, user, subscribe, queryClient]);
}
