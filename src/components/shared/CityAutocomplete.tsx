'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface IBGECity {
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla?: string;
      };
    };
  };
  'regiao-imediata'?: {
    'regiao-intermediaria'?: {
      UF?: {
        sigla?: string;
      };
    };
  };
}

interface CityOption {
  city: string;
  uf: string;
}

interface CityAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectCity: (city: string, uf: string) => void;
  error?: string;
  placeholder?: string;
}

/* ------------------------------------------------------------------ */
/*  Global cache – one fetch per session                               */
/* ------------------------------------------------------------------ */

let cachedCities: CityOption[] | null = null;
let fetchPromise: Promise<CityOption[]> | null = null;

function extractUF(m: IBGECity): string {
  return (
    m.microrregiao?.mesorregiao?.UF?.sigla ??
    m['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla ??
    ''
  );
}

async function loadCities(): Promise<CityOption[]> {
  if (cachedCities) return cachedCities;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch(
        'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome',
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error(`IBGE API ${res.status}`);

      const data: IBGECity[] = await res.json();

      const cities: CityOption[] = data.map((m) => ({
        city: m.nome,
        uf: extractUF(m),
      }));

      cachedCities = cities;
      return cities;
    } catch {
      fetchPromise = null;
      return [];
    } finally {
      clearTimeout(timer);
    }
  })();

  return fetchPromise;
}

/* ------------------------------------------------------------------ */
/*  Dropdown rendered via Portal (avoids overflow clipping)            */
/* ------------------------------------------------------------------ */

function DropdownPortal({
  anchorRef,
  listRef,
  options,
  highlightIndex,
  onSelect,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  listRef: React.RefObject<HTMLUListElement | null>;
  options: CityOption[];
  highlightIndex: number;
  onSelect: (opt: CityOption) => void;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    function update() {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef]);

  return createPortal(
    <ul
      ref={listRef}
      role="listbox"
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
      className="max-h-52 overflow-y-auto rounded-lg border border-input bg-card shadow-2xl z-[9999]"
    >
      {options.map((opt, i) => (
        <li
          key={`${opt.city}-${opt.uf}`}
          role="option"
          aria-selected={highlightIndex === i}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onSelect(opt)}
          className={cn(
            'flex items-center justify-between gap-2 px-3 py-2.5 text-sm cursor-pointer',
            'transition-colors duration-100',
            highlightIndex === i
              ? 'bg-primary/10 text-primary'
              : 'text-foreground hover:bg-muted'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
            <span className="truncate">{opt.city}</span>
          </span>
          <span className="flex-shrink-0 text-xs font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            {opt.uf}
          </span>
        </li>
      ))}
    </ul>,
    document.body
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function CityAutocomplete({
  label,
  value,
  onChange,
  onSelectCity,
  error,
  placeholder = 'Digite o nome da cidade',
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<CityOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Pre-load cities so they're cached when user starts typing
  useEffect(() => {
    loadCities();
  }, []);

  // Filter cities when user types
  const filterCities = useCallback(async (query: string) => {
    if (query.length < 2) {
      setOptions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const cities = await loadCities();

    if (cities.length === 0) {
      setIsLoading(false);
      return;
    }

    const normalised = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const filtered = cities
      .filter((c) =>
        c.city
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(normalised)
      )
      .slice(0, 30);

    setOptions(filtered);
    setHighlightIndex(-1);
    setIsOpen(filtered.length > 0);
    setIsLoading(false);
  }, []);

  // Debounced input handler
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => filterCities(val), 200);
  }

  // Select a city
  function handleSelect(opt: CityOption) {
    onSelectCity(opt.city, opt.uf);
    setIsOpen(false);
    setOptions([]);
    inputRef.current?.blur();
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(options[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const inputId = label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          autoComplete="off"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.length >= 2) filterCities(value);
          }}
          placeholder={placeholder}
          className={cn(
            'flex h-10 w-full rounded-lg border border-input bg-transparent pl-10 pr-10 py-2 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            error && 'border-destructive focus:ring-destructive'
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {isOpen && options.length > 0 && typeof window !== 'undefined' && (
        <DropdownPortal
          anchorRef={containerRef}
          listRef={listRef}
          options={options}
          highlightIndex={highlightIndex}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
