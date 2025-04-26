/* Access token provider context for token handling */

import React, { createContext, useState, ReactNode } from 'react';

// State type
interface ProviderType {
  access: string | null;
  setAccess: React.Dispatch<React.SetStateAction<string | null>>;
}

const AccessContext = createContext<ProviderType | undefined>(undefined);


export const AccessTokenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [access, setAccess] = useState<string | null>(null);

  return (
    <AccessContext.Provider value={{ access, setAccess }}>
      {children}
    </AccessContext.Provider>
  );
};

export { AccessContext };
