import { useState } from 'react';

// React 17 has no useId(), so we generate a stable per-instance id once.
let counter = 0;

export const useUniqueId = (prefix = 'sky') => {
  const [id] = useState(() => {
    counter += 1;
    return `${prefix}-${counter}`;
  });
  return id;
};

export default useUniqueId;
