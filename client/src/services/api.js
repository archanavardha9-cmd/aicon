import axios from 'axios';

const api = axios.create({
  baseURL: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api',
  timeout: 12_000,
  headers: { Accept: 'application/json' },
});

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request(config) {
  try {
    const response = await api.request(config);

    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<') ||
        response.headers?.['content-type']?.includes('text/html'))
    ) {
      throw new ApiError(
        'Invalid API response: received HTML document instead of JSON.',
        502,
        'INVALID_RESPONSE',
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isCancel(error) || error.name === 'CanceledError') {
      throw error;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error.response?.data?.error?.message ||
        error.message ||
        'The service is temporarily unavailable. Please try again.',
      error.response?.status || error.status || 0,
      error.response?.data?.error?.code || error.code || 'NETWORK_ERROR',
    );
  }
}

export function fetchCategories({ query = '', category = '', signal } = {}) {
  return request({
    method: 'get',
    url: '/categories',
    params: {
      ...(query ? { q: query } : {}),
      ...(category ? { category } : {}),
    },
    signal,
  });
}

export function fetchProducts({
  query = '',
  category = '',
  sort = 'name',
  limit = 24,
  offset = 0,
  signal,
} = {}) {
  return request({
    method: 'get',
    url: '/products',
    params: {
      ...(query ? { q: query } : {}),
      ...(category ? { category } : {}),
      sort,
      limit,
      offset,
    },
    signal,
  });
}

export function fetchProduct(productId, { signal } = {}) {
  return request({
    method: 'get',
    url: `/products/${encodeURIComponent(productId)}`,
    signal,
  });
}

export function submitEnquiry(payload, idempotencyKey) {
  return request({
    method: 'post',
    url: '/enquiries',
    data: payload,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}

export function submitContact(payload, idempotencyKey) {
  return request({
    method: 'post',
    url: '/contact',
    data: payload,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}