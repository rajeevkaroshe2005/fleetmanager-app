import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';

export function StatusBadge({ statusInfo, showDays = true, size = 'md' }) {
  if (!statusInfo) return null;

  const { status, label, badgeClass, description } = statusInfo;

  let computedClass = 'badge-gray';
  let Icon = Clock;

  if (status === 'EXPIRED' || badgeClass === 'badge-expired') {
    computedClass = 'badge-expired';
    Icon = XCircle;
  } else if (status === 'EXPIRES_TOMORROW' || status === 'EXPIRES_TODAY' || badgeClass === 'badge-urgent') {
    computedClass = 'badge-urgent';
    Icon = AlertTriangle;
  } else if (status === 'EXPIRES_2_DAYS' || badgeClass === 'badge-amber' || badgeClass === 'badge-warning') {
    computedClass = 'badge-amber';
    Icon = Clock;
  } else if (status === 'VALID' || badgeClass === 'badge-valid' || badgeClass === 'badge-success') {
    computedClass = 'badge-valid';
    Icon = CheckCircle2;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-xs'
  };

  return (
    <span className={`badge ${computedClass} ${sizeClasses[size] || sizeClasses.md} inline-flex items-center gap-1.5 font-bold`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label || status}</span>
      {showDays && description && (
        <span className="opacity-80 font-medium">· {description}</span>
      )}
    </span>
  );
}
