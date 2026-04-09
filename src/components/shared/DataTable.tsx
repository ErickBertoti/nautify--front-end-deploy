'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  LucideIcon,
  Search,
} from 'lucide-react';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  searchableFields?: string[];
  pageSize?: number;
  mobileBreakpoint?: 'sm' | 'md' | 'lg';
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  actions?: React.ReactNode;
  onRowClick?: (row: T) => void;
  renderMobileCard?: (row: T) => React.ReactNode;
}

type SortDir = 'asc' | 'desc' | null;

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
  mobileBreakpoint = 'lg',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim() || !searchableFields?.length) {
      return data;
    }

    const query = search.toLowerCase();
    return data.filter((row) =>
      searchableFields.some((field) => {
        const value = row[field];
        return value !== undefined && value !== null && String(value).toLowerCase().includes(query);
      }),
    );
  }, [data, search, searchableFields]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) {
      return filtered;
    }

    const column = columns.find((item) => item.key === sortKey);
    if (!column) {
      return filtered;
    }

    const accessor = column.sortValue || ((row: T) => row[sortKey]);
    return [...filtered].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);

      if (left == null && right == null) return 0;
      if (left == null) return 1;
      if (right == null) return -1;

      const comparison = left < right ? -1 : left > right ? 1 : 0;
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [columns, filtered, sortDir, sortKey]);

  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);
  const paginated =
    pageSize > 0 ? sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sorted;

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
      return;
    }

    if (sortDir === 'asc') {
      setSortDir('desc');
      return;
    }

    setSortKey(null);
    setSortDir(null);
  }

  function SortIcon({ column }: { column: Column<T> }) {
    if (!column.sortable) return null;
    if (sortKey !== column.key) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    }

    return sortDir === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
      : <ChevronDown className="h-3.5 w-3.5 text-primary" />;
  }

  const hasData = paginated.length > 0;
  const desktopVisibilityClasses = {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
  } as const;
  const mobileVisibilityClasses = {
    sm: 'sm:hidden',
    md: 'md:hidden',
    lg: 'lg:hidden',
  } as const;

  return (
    <div className="space-y-4">
      {(searchableFields?.length || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {searchableFields?.length ? (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          ) : (
            <div />
          )}
          {actions && <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:shrink-0">{actions}</div>}
        </div>
      )}

      <div className={cn(desktopVisibilityClasses[mobileBreakpoint], 'overflow-x-auto rounded-2xl border border-border')}>
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                    column.sortable && 'cursor-pointer select-none transition-colors hover:text-foreground',
                    column.className,
                  )}
                  onClick={() => column.sortable && toggleSort(column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {column.header}
                    <SortIcon column={column} />
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
                  className={cn('transition-colors', onRowClick && 'cursor-pointer hover:bg-muted/50')}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={cn('px-4 py-3 text-sm text-foreground', column.className)}>
                      {column.render ? column.render(row) : (row[column.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={cn(mobileVisibilityClasses[mobileBreakpoint], 'space-y-3')}>
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
                  'rounded-2xl border border-border bg-card/90 p-4',
                  onRowClick && 'cursor-pointer transition-colors hover:bg-muted/30',
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <div key={column.key} className="space-y-1.5 border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                    <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {column.header}
                    </span>
                    <div className="break-words text-sm leading-relaxed text-foreground">
                      {column.render ? column.render(row) : (row[column.key] as React.ReactNode)}
                    </div>
                  </div>
                ))}
              </div>
            ),
          )
        ) : (
          <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
        )}
      </div>

      {pageSize > 0 && sorted.length > pageSize && (
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground">
            {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sorted.length)} de {sorted.length}
          </span>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage <= 1}
              className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Pagina anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((item) => item === 1 || item === totalPages || Math.abs(item - currentPage) <= 1)
              .reduce<(number | 'dots')[]>((acc, item, index, items) => {
                if (index > 0 && item - items[index - 1] > 1) {
                  acc.push('dots');
                }
                acc.push(item);
                return acc;
              }, [])
              .map((item, index) =>
                item === 'dots' ? (
                  <span key={`dots-${index}`} className="px-1 text-muted-foreground">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={cn(
                      'min-w-[2rem] h-8 rounded-md text-sm font-medium transition-colors cursor-pointer',
                      item === currentPage ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
                    )}
                  >
                    {item}
                  </button>
                ),
              )}
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={currentPage >= totalPages}
              className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
              aria-label="Proxima pagina"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
