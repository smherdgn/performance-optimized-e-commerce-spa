import { onCLS, onFCP, onINP, onLCP, Metric } from 'web-vitals';

declare global {
  interface Window {
    __metrics: Metric[];
  }
}

window.__metrics = [];

function logMetric(metric: Metric) {
  window.__metrics.push(metric);
  console.log(metric);
  
  // In a real application, you would send this to an analytics endpoint.
  // We can simulate this with a log.
  // Example: navigator.sendBeacon('/metrics.jsonl', JSON.stringify(metric));
}

export function reportWebVitals() {
  onCLS(logMetric);
  onFCP(logMetric);
  onINP(logMetric);
  onLCP(logMetric);
}
