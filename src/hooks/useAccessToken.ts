/* Hook for manage access token globally */

import { AccessContext } from '../contexts/AccessProvider';
import { useContext } from 'react';


export const useAccessToken = () => {
  const context = useContext(AccessContext);

  if (!context) {
    throw new Error('useAccessToken must be used within AccessTokenProvider (wrap with AccessTokenProvider).');
  };

  return context;
};
