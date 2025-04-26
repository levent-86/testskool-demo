/* Hook for manage user data globally */

import { UserContext } from '../contexts/UserProvider';
import { useContext } from 'react';


export const useUserData = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider (wrap with UserDataProvider).');
  };

  return context;
};
