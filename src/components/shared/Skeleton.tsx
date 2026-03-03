'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Base Skeleton
// ============================================
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted animate-pulse',
        className
      )}
    />
  );
}

// ============================================
// Predefined Skeleton Layouts
// ============================================

/** Skeleton for a StatCard */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/** Skeleton for a table row */
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
      {Array.from({ length: cols }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4 rounded',
            i === 0 ? 'w-32' : i === cols - 1 ? 'w-16' : 'w-24 flex-1'
          )}
        />
      ))}
    </div>
  );
}

/** Skeleton for a full table with header + rows */
export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 bg-muted/50">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className={cn('h-3', i === 0 ? 'w-28' : 'w-20 flex-1')} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonTableRow key={i} cols={cols} />
      ))}
    </div>
  );
}

/** Skeleton for a profile / detail page */
export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

/** Dashboard page skeleton - stat cards + table */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      {/* Table */}
      <SkeletonTable rows={5} cols={4} />
    </div>
  );
}
