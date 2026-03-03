'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  LucideIcon,
} from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';

// ============================================
// Types
// ============================================
export interface Column<T> {
  key: string;
  header: string;
  /** Render custom cell content. Falls back to row[key] */
  render?: (row: T) => React.ReactNode;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Accessor for sort comparison. Falls back to row[key] */
  sortValue?: (row: T) => string | number;
  /** Tailwind classes for the column (e.g. 'hidden lg:table-cell') */
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** Unique key accessor for each row */
  keyExtractor: (row: T) => string | number;
  /** Searchable fields (keys in T). If undefined, search is disabled. */
  searchableFields?: string[];
  /** Items per page. Default 10, 0 = no pagination */
  pageSize?: number;
  /** Show mobile card layout below this breakpoint class (default: 'lg') */
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
  /** Empty state props */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  /** Actions rendered above the table (right side) */
  actions?: React.ReactNode;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Mobile card renderer for responsive layouts */
  renderMobileCard?: (row: T) => React.ReactNode;
}

type SortDir = 'asc' | 'desc' | null;

// ============================================
// Component
// ============================================
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  searchableFields,
  pageSize = 10,
  emptyTitle = 'Nenhum registro encontrado',
  emptyDescription = 'Tente ajustar os filtros ou adicione novos dados.',
  emptyIcon,
  actions,
  onRowClick,
  renderMobileCard,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  // ─── Filter ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim() || !searchableFields?.length) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchableFields.some((field) => {
        const val = row[field];
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchableFields]);

  // ─── Sort ──────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const accessor = col.sortValue || ((row: T) => row[sortKey]);
    return [...filtered].sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  // ─── Paginate ──────────────────────────────────────────
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = pageSize > 0 ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

  // Reset page when search/filter changes
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }

  function SortIcon({ col }: { col: Column<T> }) {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
      : <ChevronDown className="h-3.5 w-3.5 text-primary" />;
  }

  const hasData = paginated.length > 0;

  return (
    <div className="space-y-4">
      {/* ─── Toolbar ── */}
      {(searchableFields?.length || actions) && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {searchableFields?.length ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>
          ) : <div />}
          {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      {/* ─── Desktop Table ── */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider',
                    col.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors',
                    col.className
                  )}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {hasData ? (
              paginated.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-muted/50'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn('px-4 py-3 text-sm text-foreground', col.className)}
                    >
                      {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Mobile Cards ── */}
      <div className="lg:hidden space-y-3">
        {hasData ? (
          paginated.map((row) =>
            renderMobileCard ? (
              <div key={keyExtractor(row)} onClick={() => onRowClick?.(row)}>
                {renderMobileCard(row)}
              </div>
            ) : (
              <div
                key={keyExtractor(row)}
                className={cn(
                  'rounded-lg border border-border bg-card p-4 space-y-2',
                  onRowClick && 'cursor-pointer hover:bg-muted/30 transition-colors'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <div key={col.key} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">{col.header}</span>
                    <span className="text-sm text-foreground text-right">
                      {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                    </span>
                  </div>
                ))}
              </div>
            )
          )
        ) : (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </div>

      {/* ─── Pagination ── */}
      {pageSize > 0 && sorted.length > pageSize && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sorted.length)} de {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | 'dots')[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1]) > 1) acc.push('dots');
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === 'dots' ? (
                  <span key={`dots-${i}`} className="px-1 text-muted-foreground">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={cn(
                      'min-w-[2rem] h-8 rounded-md text-sm font-medium transition-colors cursor-pointer',
                      item === currentPage
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {item}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-md hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
