import React from 'react';

export function NumberPlate({ number, isCommercial = true, className = '' }) {
  if (!number) return null;

  return (
    <div className={`number-plate ${isCommercial ? 'number-plate-yellow' : 'bg-slate-100 text-slate-900 border border-slate-300'} ${className}`}>
      <div className="number-plate-ind">
        <span>IND</span>
      </div>
      <span className="font-mono tracking-wider font-extrabold">{number}</span>
    </div>
  );
}
