'use client';

import { useApi } from './useApi';
import { boatService, tripService } from '@/services';
import type { Boat, Trip } from '@/types';

export function useBoats() {
  const { data, loading } = useApi<Boat[]>(() => boatService.list(), []);
  return { boats: data ?? [], loading };
}

export function useBoatMembers(boatId: string) {
  const { data: boat } = useApi<Boat>(
    async () => {
      if (!boatId) return { data: null as unknown as Boat };
      return boatService.getById(boatId);
    },
    [boatId],
  );
  const members = (boat?.members ?? []).filter((m) => m.isActive);
  return {
    socios: members.filter((m) => m.role === 'socio' || m.role === 'admin'),
    sailors: members.filter((m) => m.role === 'marinheiro'),
  };
}

export function useTrips(boatId: string) {
  const { data, loading } = useApi<Trip[]>(
    async () => {
      if (!boatId) return { data: [] as Trip[] };
      return tripService.list({ boatId });
    },
    [boatId],
  );
  return { trips: data ?? [], loading };
}
