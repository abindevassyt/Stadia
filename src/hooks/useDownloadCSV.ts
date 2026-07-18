import { useCallback } from 'react';

interface UseDownloadCSVOptions<T> {
  headers?: string[];
  getRows?: (item: T) => (string | number | boolean | null | undefined)[];
}

/**
 * Reusable React hook for triggering browser-native downloads of CSV reports.
 * 
 * @param data Array of items to format as CSV
 * @param filename Desired filename for the downloaded CSV file
 * @param options Optional configuration including header array and mapping function
 */
export function useDownloadCSV<T>(
  data: T[],
  filename: string,
  options?: UseDownloadCSVOptions<T>
) {
  const triggerDownload = useCallback(() => {
    if (!data || data.length === 0) {
      console.warn('useDownloadCSV: No data available to export.');
      return;
    }

    let csvContent = '';

    if (options?.getRows && options?.headers) {
      // Use custom mapper and defined headers
      const csvRows = [
        options.headers.join(','),
        ...data.map(item => {
          return options.getRows!(item)
            .map(val => {
              const valStr = val === undefined || val === null ? '' : String(val);
              // Escape quotes and commas if necessary
              if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
                return `"${valStr.replace(/"/g, '""')}"`;
              }
              return valStr;
            })
            .join(',');
        })
      ];
      csvContent = csvRows.join('\n');
    } else {
      // Fallback: Automatic key-value extraction
      const firstItem = data[0];
      const keys = Object.keys(firstItem as object);
      const csvRows = [
        keys.join(','),
        ...data.map(item => {
          return keys.map(key => {
            const val = (item as any)[key];
            const valStr = val === undefined || val === null ? '' : String(val);
            if (valStr.includes(',') || valStr.includes('"') || valStr.includes('\n')) {
              return `"${valStr.replace(/"/g, '""')}"`;
            }
            return valStr;
          }).join(',');
        })
      ];
      csvContent = csvRows.join('\n');
    }

    // Browser-native Blob conversion & Anchor Link Simulation
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, filename, options?.headers, options?.getRows]);

  return triggerDownload;
}
