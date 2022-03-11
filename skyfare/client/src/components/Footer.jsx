import React from 'react';

const Footer = () => (
  <footer className="mt-16 border-t border-slate-100 bg-white">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6">
      <p>SkyFare — a MERN portfolio project. Flight data via the Amadeus Self-Service API.</p>
      <p className="text-xs text-slate-400">Demo only · no real bookings or payments are made.</p>
    </div>
  </footer>
);

export default Footer;
