import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFoundPage = () => (
  <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
    <span className="font-display text-7xl font-extrabold text-sky-600">404</span>
    <h1 className="mt-3 text-xl font-bold text-slate-900">This page took off without us</h1>
    <p className="mt-2 text-sm text-slate-500">
      The page you’re looking for doesn’t exist or has been moved.
    </p>
    <Link to="/" className="mt-6">
      <Button>Back to search</Button>
    </Link>
  </div>
);

export default NotFoundPage;
