const origin = import.meta.env.VITE_API_URL;
const BASE = origin ? `${origin.replace(/\/$/, "")}/api` : "/api";

async function request(path, options = {}) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || "Request failed");
  return data;
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || res.statusText || "Upload failed");
  return data;
}

export async function getSalesSummary(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/sales/summary${q ? `?${q}` : ""}`);
}

export async function getSalesFilter(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/sales/filter${q ? `?${q}` : ""}`);
}

export async function getSalesTrends(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/sales/trends${q ? `?${q}` : ""}`);
}

export async function getDashboard(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/analytics/dashboard${q ? `?${q}` : ""}`);
}

export async function getProductsPerCategory() {
  return request("/analytics/products-per-category");
}

export async function getTopReviewed(limit = 10) {
  return request(`/analytics/top-reviewed?limit=${limit}`);
}

export async function getDiscountDistribution(buckets = 10) {
  return request(`/analytics/discount-distribution?buckets=${buckets}`);
}

export async function getCategoryRating() {
  return request("/analytics/category-rating");
}
