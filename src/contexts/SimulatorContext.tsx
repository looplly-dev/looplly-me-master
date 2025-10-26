import { createContext, useContext, ReactNode } from 'react';

interface SimulatorContextType {
  isSimulatorMode: boolean;
}

const SimulatorContext = createContext<SimulatorContextType>({
  isSimulatorMode: false,
});

export const useSimulator = () => useContext(SimulatorContext);

interface SimulatorProviderProps {
  children: ReactNode;
}

export function SimulatorProvider({ children }: SimulatorProviderProps) {
  return (
    <SimulatorContext.Provider value={{ isSimulatorMode: true }}>
      {children}
    </SimulatorContext.Provider>
  );
}
