import React from 'react';

export const ConsumerNav = ({ setPage, active }) => {
  const items = [
    { id: 'consumer', label: 'Shop' },
    { id: 'history', label: 'History' },
    { id: 'gateway', label: 'Switch Role' },
  ];
  return (
    <nav aria-label="Consumer navigation" className="fixed top-4 left-1/2 -translate-x-1/2 z-20 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-slate-700 max-w-[95vw]">
      <ul className="flex items-center gap-1 px-2 sm:px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {items.map(it => (
          <li key={it.id}>
            <button onClick={() => setPage(it.id)} className={`px-4 py-2 text-sm md:text-base rounded-full transition-colors ${active === it.id ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>{it.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const WorkerNav = ({ setPage, active }) => {
  const items = [
    { id: 'worker', label: 'Leaves' },
    { id: 'gateway', label: 'Switch Role' },
  ];
  return (
    <nav aria-label="Worker navigation" className="fixed top-4 left-1/2 -translate-x-1/2 z-20 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-slate-700 max-w-[95vw]">
      <ul className="flex items-center gap-1 px-2 sm:px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {items.map(it => (
          <li key={it.id}>
            <button onClick={() => setPage(it.id)} className={`px-4 py-2 text-sm md:text-base rounded-full transition-colors ${active === it.id ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>{it.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export const OwnerNav = ({ setPage, active }) => {
  const items = [
    { id: 'owner', label: 'Dashboard' },
    { id: 'gateway', label: 'Switch Role' },
  ];
  return (
    <nav aria-label="Owner navigation" className="fixed top-4 left-1/2 -translate-x-1/2 z-20 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-full shadow-lg border border-gray-200 dark:border-slate-700 max-w-[95vw]">
      <ul className="flex items-center gap-1 px-2 sm:px-3 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {items.map(it => (
          <li key={it.id}>
            <button onClick={() => setPage(it.id)} className={`px-4 py-2 text-sm md:text-base rounded-full transition-colors ${active === it.id ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>{it.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default null;


