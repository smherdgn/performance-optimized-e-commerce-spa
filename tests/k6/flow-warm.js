import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Warm-up / load test: ramp up to 20 VUs
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% failed requests
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // This script simulates the same flow as the smoke test but under more load.
  
  // 1. Visit Home page
  let res = http.get(BASE_URL);
  check(res, { 'Home page status was 200': (r) => r.status === 200 });
  sleep(1);

  // 2. Go to Catalog
  res = http.get(`${BASE_URL}/#/catalog`);
  check(res, { 'Catalog page status was 200': (r) => r.status === 200 });
  sleep(Math.random() * 3); // Simulate scrolling/browsing

  // 3. View a Product
  const productId = Math.floor(Math.random() * 20) + 1; // Random product
  res = http.get(`${BASE_URL}/#/product/${productId}`);
  check(res, { 'Product page status was 200': (r) => r.status === 200 });
  sleep(1);
  
  // 4. Go to Checkout
  res = http.get(`${BASE_URL}/#/checkout`);
  check(res, { 'Checkout page status was 200': (r) => r.status === 200 });
  sleep(1);
}
