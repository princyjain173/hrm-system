import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(c => { const t = localStorage.getItem('token'); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
export default api;
export const msg = e => e.response?.data?.message || 'Something went wrong';
export const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
export const tm = d => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';
export function useList(url, params = {}) {
  const [page, setPage] = useState(1), [data, setData] = useState({ items: [], pages: 1 }), [loading, setLoading] = useState(true);
  const key = JSON.stringify(params);
  const load = useCallback(() => { setLoading(true); api.get(url, { params: { ...params, page } }).then(r => setData(r.data)).finally(() => setLoading(false)); }, [url, key, page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [key]);
  return { ...data, page, setPage, loading, reload: load };
}
