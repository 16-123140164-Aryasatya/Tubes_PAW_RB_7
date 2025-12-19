/**
 * Debounce hook untuk mengurangi pemanggilan function yang sering
 * Berguna untuk search, filter, resize handlers
 */
export function debounce(func, delay) {
  let timeoutId;
  
  return function debounced(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * React hook untuk debounce value
 * Berguna ketika ingin menunggu user selesai typing sebelum API call
 */
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
