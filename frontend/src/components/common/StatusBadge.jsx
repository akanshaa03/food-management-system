import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'SAFE':
      case 'AVAILABLE':
      case 'APPROVED':
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'EXPIRING_SOON':
      case 'EXPIRING SOON':
      case 'PENDING':
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse';
      case 'EXPIRED':
      case 'CRITICAL':
      case 'HIGH':
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'CLAIMED':
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle(
        status
      )}`}
    >
      {status?.replace('_', ' ') || 'UNKNOWN'}
    </span>
  );
};
