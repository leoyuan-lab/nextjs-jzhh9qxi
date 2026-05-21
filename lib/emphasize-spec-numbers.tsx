import type { ReactNode } from 'react';

/** 规格文案中的数字 token（不含单位）；保留 ± 前缀 */
const SPEC_NUM_TOKEN = /(±?\d+(?:\.\d+)?)/g;

export function specValuesDiffer(values: readonly string[]): boolean {
  const normalized = values.map((v) => v.trim());
  return new Set(normalized).size > 1;
}

/** 仅当该列数值与同排其他列不同时强调（忽略 em dash 占位） */
export function specCellEmphasize(values: readonly string[], colIndex: number): boolean {
  const normalized = values.map((v) => v.trim());
  const self = normalized[colIndex] ?? '';
  if (!self || self === '—') return false;
  return normalized.some((value, index) => index !== colIndex && value !== '—' && value !== self);
}

export function EmphasizeSpecNumbers({
  text,
  emphasize,
  className,
}: {
  text: string;
  emphasize: boolean;
  className?: string;
}) {
  if (!emphasize || !text || text === '—') {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(SPEC_NUM_TOKEN);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] ?? '';
    if (!part) continue;
    if (i % 2 === 1) {
      nodes.push(
        <span key={`${i}-${part}`} className="spec-diff-num">
          {part}
        </span>,
      );
    } else {
      nodes.push(part);
    }
  }

  return <span className={className}>{nodes}</span>;
}
