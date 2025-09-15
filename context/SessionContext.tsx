import React, { createContext, useContext, useState, ReactNode } from 'react';

type SessionType = 'work' | 'short-break' | 'long-break';

interface SessionContextType {
  sessionType: SessionType;
  setSessionType: (type: SessionType) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [sessionType, setSessionType] = useState<SessionType>('work');

  return (
    <SessionContext.Provider value={{ sessionType, setSessionType }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
