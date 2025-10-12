#!/usr/bin/env python3
"""
Reads aggregated metrics from reports/summary.json and performs a one-way ANOVA
for selected metrics (LCP, FCP) across all variants for each tool.

SciPy is used when available; otherwise a lightweight fallback implementation
provides F-statistics and p-values based on the regularised incomplete beta
function. Results are written to reports/anova-results.txt.
"""

from __future__ import annotations

import json
import math
import statistics
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

SUMMARY_PATH = Path('reports/summary.json')
OUTPUT_PATH = Path('reports/anova-results.txt')
VARIANT_ORDER = ['A', "A'", 'B', "B'", 'C', "C'", 'D', "D'"]
TARGET_METRICS = ('LCP', 'FCP')

try:
    from scipy.stats import f_oneway  # type: ignore

    def anova(groups: Iterable[List[float]]) -> Tuple[float, float]:
        arrays = [list(group) for group in groups]
        return f_oneway(*arrays)

    SCIPY_AVAILABLE = True
except Exception:  # pragma: no cover - SciPy may be absent
    SCIPY_AVAILABLE = False

    def anova(groups: Iterable[List[float]]) -> Tuple[float, float]:
        arrays = [list(group) for group in groups if len(group) > 0]
        k = len(arrays)
        if k < 2:
            raise ValueError('ANOVA requires at least two non-empty groups.')

        counts = [len(group) for group in arrays]
        totals = sum(counts)
        if any(count < 2 for count in counts):
            raise ValueError('Each group must contain at least two samples.')

        grand_total = sum(sum(group) for group in arrays)
        grand_mean = grand_total / totals

        ss_between = sum(count * (statistics.mean(group) - grand_mean) ** 2 for group, count in zip(arrays, counts))
        ss_within = sum(sum((value - statistics.mean(group)) ** 2 for value in group) for group in arrays)

        df_between = k - 1
        df_within = totals - k

        if ss_within == 0:
            return float('inf'), 0.0

        ms_between = ss_between / df_between
        ms_within = ss_within / df_within
        f_stat = ms_between / ms_within
        p_value = f_distribution_sf(f_stat, df_between, df_within)
        return f_stat, p_value

    def f_distribution_sf(f_value: float, df_between: int, df_within: int) -> float:
        """Survival function (1-CDF) for the F distribution."""
        if math.isnan(f_value) or math.isinf(f_value):
            return 0.0
        x = df_within / (df_within + df_between * f_value)
        return incomplete_beta(df_within / 2.0, df_between / 2.0, x)

    def incomplete_beta(a: float, b: float, x: float) -> float:
        if x <= 0.0:
            return 1.0
        if x >= 1.0:
            return 0.0
        ln_beta = math.lgamma(a + b) - math.lgamma(a) - math.lgamma(b)
        front = math.exp(a * math.log(x) + b * math.log(1 - x) - ln_beta)

        if x < (a + 1) / (a + b + 2):
            return front * betacf(a, b, x) / a
        return 1.0 - front * betacf(b, a, 1 - x) / b

    def betacf(a: float, b: float, x: float, max_iter: int = 200, eps: float = 1e-12) -> float:
        """Continued fraction for incomplete beta function."""
        am, bm = 1.0, 1.0
        az = 1.0
        qab = a + b
        qap = a + 1.0
        qam = a - 1.0

        bz = 1.0 - qab * x / qap
        if abs(bz) < eps:
            bz = eps

        for m in range(1, max_iter + 1):
            em = float(m)
            tem = em + em
            d = em * (b - m) * x / ((qam + tem) * (a + tem))
            ap = az + d * am
            bp = bz + d * bm
            d = -(a + em) * (qab + em) * x / ((a + tem) * (qap + tem))
            app = ap + d * az
            bpp = bp + d * bz
            am, bm = ap, bp
            az, bz = app, bpp
            if abs(az) < eps:
                az = eps
            if abs(bz) < eps:
                bz = eps
            if abs(app / bpp - az / bz) < eps:
                break

        return az / bz


def main() -> None:
    if not SUMMARY_PATH.exists():
        ensure_output_dir()
        OUTPUT_PATH.write_text(
            'ANOVA Results\nNo summary.json found. Run `pnpm run-matrix` before analysing.\n',
            encoding='utf-8',
        )
        print(f'ANOVA skipped: missing summary file at {SUMMARY_PATH}')
        return

    with SUMMARY_PATH.open('r', encoding='utf-8') as handle:
        summary = json.load(handle)

    tools = summary.get('tools', {})
    if not tools:
        ensure_output_dir()
        OUTPUT_PATH.write_text(
            'ANOVA Results\nInsufficient data in summary.json. Populate reports by running `pnpm run-matrix`.\n',
            encoding='utf-8',
        )
        print('ANOVA skipped: no tool data found in summary.json.')
        return

    ensure_output_dir()

    lines: List[str] = []
    lines.append('ANOVA Results')
    lines.append(f'Generated from {SUMMARY_PATH}')
    lines.append(f'SciPy available: {SCIPY_AVAILABLE}')
    lines.append('')

    for tool, tool_data in tools.items():
        lines.append(f'Tool: {tool.upper()}')
        variants = tool_data.get('variants', {})
        for metric in TARGET_METRICS:
          # gather groups in variant order
            groups: List[List[float]] = []
            labels: List[str] = []
            for variant_key in VARIANT_ORDER:
                variant_data = variants.get(variant_key)
                if not variant_data:
                    continue
                metric_info = variant_data.get('metrics', {}).get(metric)
                if not metric_info:
                    continue
                values = metric_info.get('values') or []
                if len(values) >= 2:
                    groups.append(values)
                    labels.append(variant_key)

            if len(groups) < 2:
                lines.append(f'  Metric: {metric} -> skipped (insufficient data)')
                continue

            try:
                f_stat, p_value = anova(groups)
            except ValueError as exc:
                lines.append(f'  Metric: {metric} -> skipped ({exc})')
                continue

            df_between = len(groups) - 1
            df_within = sum(len(group) for group in groups) - len(groups)
            significance = '***' if p_value < 0.01 else ('**' if p_value < 0.05 else '')
            decision = 'Significant difference detected.' if p_value < 0.05 else 'No significant difference.'

            lines.append(
                f'  Metric: {metric} | F({df_between}, {df_within}) = {f_stat:.4f}, p = {p_value:.6f} {significance}'.rstrip()
            )
            lines.append(f'    {decision} (p < 0.05 threshold)')
        lines.append('')

    OUTPUT_PATH.write_text('\n'.join(lines).rstrip() + '\n', encoding='utf-8')
    print(f'ANOVA results written to {OUTPUT_PATH}')


def ensure_output_dir() -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)


if __name__ == '__main__':
    main()
