import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Smoke test: 1-5 VUs for a short duration
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 5 },
    { duration: '10s', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // 1. Visit Home page
  let res = http.get(BASE_URL);
  check(res, { 'Home page status was 200': (r) => r.status === 200 });
  sleep(1);

  // 2. Go to Catalog
  res = http.get(`${BASE_URL}/#/catalog`);
  check(res, { 'Catalog page status was 200': (r) => r.status === 200 });
  sleep(2);

  // 3. View a Product
  res = http.get(`${BASE_URL}/#/product/1`);
  check(res, { 'Product page status was 200': (r) => r.status === 200 });
  sleep(1);
  
  // 4. View Cart
  res = http.get(`${BASE_URL}/#/cart`);
  check(res, { 'Cart page status was 200': (r) => r.status === 200 });
  sleep(1);
}
