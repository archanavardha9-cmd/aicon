import axios from 'axios';

export function resolveApiBaseUrl(rawUrl = (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined)) {
  if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
    return '/api';
  }
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  // If user provided origin like 'https://backend.vercel.app' or 'http://localhost:3001',
  // ensure it ends with '/api' so all endpoint calls (/enquiries, /contact, etc.)
  // correctly target the backend's /api namespace.
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15_000,
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

    const isHtmlError =
      typeof error.response?.data === 'string' &&
      (error.response.data.trim().startsWith('<') ||
        error.response.headers?.['content-type']?.includes('text/html'));

    const message = isHtmlError
      ? 'The API service is temporarily unavailable or misconfigured. Please try again.'
      : error.response?.data?.error?.message ||
        error.message ||
        'The service is temporarily unavailable. Please try again.';

    throw new ApiError(
      message,
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