'use client';

import { useEffect, useMemo, useState } from 'react';

interface Complex {
  id: number;
  name: string;
}

export function useComplexes() {
  const [complexes, setComplexes] = useState<Complex[]>([]);

  useEffect(() => {
    const fetchComplexes = async () => {
      try {
        const response = await fetch('/api/admin/complexes');
        const data = await response.json();
        if (data.complexes) {
          setComplexes(data.complexes);
        }
      } catch (err) {
        console.error('Error fetching complexes:', err);
      }
    };

    fetchComplexes();
  }, []);

  const complexNameMap = useMemo(() => {
    return new Map(complexes.map((complex) => [complex.id, complex.name]));
  }, [complexes]);

  const getComplexName = (complexId: number | null) => {
    if (!complexId) return '-';
    return complexNameMap.get(complexId) || `مجموعه ${complexId}`;
  };

  return {
    complexes,
    getComplexName,
  };
}
