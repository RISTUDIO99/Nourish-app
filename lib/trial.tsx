import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/expo';
import {
  getGetTrialStatusQueryKey,
  setAuthTokenGetter,
  useGetTrialStatus,
  type TrialStatus,
} from '@/lib/api-client';

type TrialContextValue = {
  trial: TrialStatus | undefined;
  isLoading: boolean;
  isActive: boolean;
  daysRemaining: number;
};

const TrialContext = createContext<TrialContextValue | null>(null);

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const [authReady, setAuthReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [serverClockOffset, setServerClockOffset] = useState(0);

  useEffect(() => {
    setAuthReady(false);
    setAuthTokenGetter(isSignedIn ? () => getToken() : null);
    setAuthReady(Boolean(isSignedIn));

    return () => {
      setAuthTokenGetter(null);
    };
  }, [getToken, isSignedIn]);

  const query = useGetTrialStatus({
    query: {
      queryKey: getGetTrialStatusQueryKey(),
      enabled: Boolean(isSignedIn) && authReady,
      staleTime: 60_000,
      retry: 1,
    },
  });
  const trial = query.data;
  const trialEndsAt = trial?.trialEndsAt ? new Date(trial.trialEndsAt).getTime() : 0;

  useEffect(() => {
    if (!trial?.serverNow) return;
    const nextOffset = new Date(trial.serverNow).getTime() - Date.now();
    setServerClockOffset(nextOffset);
    setNow(Date.now() + nextOffset);
  }, [trial?.serverNow]);

  useEffect(() => {
    if (!trial?.active || !trialEndsAt) return;

    const currentServerTime = () => Date.now() + serverClockOffset;
    const tick = setInterval(() => setNow(currentServerTime()), 60_000);
    const expiresIn = Math.max(0, trialEndsAt - currentServerTime());
    const expire = setTimeout(() => {
      setNow(currentServerTime());
      void query.refetch();
    }, expiresIn + 25);

    return () => {
      clearInterval(tick);
      clearTimeout(expire);
    };
  }, [query.refetch, serverClockOffset, trial?.active, trialEndsAt]);

  const isActive = Boolean(trial?.active) && trialEndsAt > now;
  const daysRemaining = isActive ? trial?.daysRemaining ?? 0 : 0;
  const value: TrialContextValue = {
    trial,
    isLoading: Boolean(isSignedIn) && query.isLoading,
    isActive,
    daysRemaining,
  };
  return <TrialContext.Provider value={value}>{children}</TrialContext.Provider>;
}

export function useTrial() {
  const context = useContext(TrialContext);
  if (!context) throw new Error('useTrial must be used within TrialProvider.');
  return context;
}

export function trialCountdownCopy(daysRemaining: number) {
  if (daysRemaining <= 0) return 'Your full-access trial has ended.';
  if ([11, 7, 3, 1].includes(daysRemaining)) {
    return daysRemaining === 1 ? '1 day left in your full-access trial.' : `${daysRemaining} days left in your full-access trial.`;
  }
  return `${daysRemaining} days left in your 14-day full-access trial.`;
}