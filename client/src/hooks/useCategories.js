import { useEffect, useState } from 'react';
import { fetchCategories } from '../services/api';
import { categories as defaultCategories } from '../data/categories';

export default function useCategories() {
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchCategories({ signal: controller.signal })
      .then((result) => {
        if (result?.data?.length) {
          setCategories(result.data);
        }
      })
      .catch((requestError) => {
        if (requestError.name !== 'CanceledError') {
          // If network error occurs, keep the defaultCategories rather than breaking UI
          setCategories((current) => {
            if (!current.length) {
              setError(requestError.message);
            }
            return current;
          });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [attempt]);

  return {
    categories,
    loading,
    error,
    retry: () => {
      setLoading(true);
      setError('');
      setAttempt((value) => value + 1);
    },
  };
}
