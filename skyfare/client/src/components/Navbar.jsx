import React from 'react';
import { Link, NavLink } from 'react-router-dom';

const navLinkClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

const PlaneMark = () => (
  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-soft">
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
    </svg>
  </span>
);

const Navbar = () => (
  <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
      <Link to="/" className="flex items-center gap-2.5">
        <PlaneMark />
        <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">
          Sky<span className="text-sky-600">Fare</span>
        </span>
      </Link>

      <div className="flex items-center gap-1">
        <NavLink to="/" end className={navLinkClass}>
          Search
        </NavLink>
        <NavLink to="/bookings" className={navLinkClass}>
          My trips
        </NavLink>
      </div>
    </nav>
  </header>
);

export default Navbar;
