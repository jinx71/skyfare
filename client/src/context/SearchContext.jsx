import React, { createContext, useContext, useMemo, useState } from 'react';

const SearchContext = createContext(null);

/**
 * Holds the small amount of state that needs to survive between the search →
 * results → checkout → confirmation pages. Search params live in the URL (so
 * results are refetchable on refresh); the chosen offer + the confirmed booking
 * are richer objects we keep here.
 */
export const SearchProvider = ({ children }) => {
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null); // { tripType, passengers, mock, ... }
  const [lastBooking, setLastBooking] = useState(null);

  const value = useMemo(
    () => ({
      selectedOffer,
      setSelectedOffer,
      searchMeta,
      setSearchMeta,
      lastBooking,
      setLastBooking,
    }),
    [selectedOffer, searchMeta, lastBooking]
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchContext must be used within a SearchProvider');
  return ctx;
};

export default SearchContext;
