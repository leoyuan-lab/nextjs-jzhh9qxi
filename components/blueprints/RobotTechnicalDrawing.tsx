'use client';

import { useMemo } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import Image from 'next/image';
import SVG from 'react-inlinesvg';
const InlineSvgAny = SVG as any;

type RobotTechnicalDrawingProps = {
  src: string;
  className?: string;
  color?: string;
  title?: string;
  animate?: boolean;
};

function uniquifySvgIds(svgText: string, suffix: string): string {
  const idMap = new Map<string, string>();
  const idRegex = /\sid=(['"])([^'"]+)\1/g;
  let match: RegExpExecArray | null;
  while ((match = idRegex.exec(svgText)) !== null) {
    const original = match[2];
    if (!idMap.has(original)) idMap.set(original, `${original}-${suffix}`);
  }

  let output = svgText;
  idMap.forEach((newId, oldId) => {
    const idRef = new RegExp(`([#(])${oldId}([)\"'])`, 'g');
    const hrefRef = new RegExp(`(["'])#${oldId}(["'])`, 'g');
    const idAttr = new RegExp(`(\\sid=(['"]))${oldId}(\\2)`, 'g');
    output = output.replace(idAttr, `$1${newId}$3`);
    output = output.replace(idRef, `$1${newId}$2`);
    output = output.replace(hrefRef, `$1#${newId}$2`);
  });
  return output;
}

function cleanupStyles(svgText: string): string {
  let output = svgText;
  output = output.replace(/<\?xml[\s\S]*?\?>/gi, '');
  output = output.replace(/<\/?ns\d+:/gi, (m) => m.replace(/ns\d+:/, ''));
  output = output.replace(/\sxmlns:ns\d+="[^"]*"/gi, '');
  output = output.replace(/\sxmlns:ns\d+='[^']*'/gi, '');
  output = output.replace(/<svg([^>]*?)>/i, (all, attrs) => {
    let nextAttrs = attrs;
    if (!/xmlns=/.test(nextAttrs)) nextAttrs = ` xmlns="http://www.w3.org/2000/svg"${nextAttrs}`;
    if (!/preserveAspectRatio=/.test(nextAttrs)) nextAttrs = `${nextAttrs} preserveAspectRatio="xMidYMid meet"`;
    return `<svg${nextAttrs}>`;
  });
  output = output.replace(/\s(?:width|height)=["'][^"']*["']/g, '');
  output = output.replace(/\sstyle=(['"])[\s\S]*?\1/g, '');
  output = output.replace(/<rect[^>]*\bfill=(['"])(#fff|#ffffff|white|rgb\(255,\s*255,\s*255\))\1[^>]*\/?>/gi, '');
  output = output.replace(/<(?:[a-zA-Z_][\w.-]*:)?path\b([^>]*)>/gi, (all, attrs: string) => {
    const d = (attrs.match(/\sd=(['"])([\s\S]*?)\1/i)?.[2] ?? '').replace(/\s+/g, '').toUpperCase();
    const fill = (attrs.match(/\sfill=(['"])([\s\S]*?)\1/i)?.[2] ?? '').trim().toLowerCase();
    const stroke = (attrs.match(/\sstroke=(['"])([\s\S]*?)\1/i)?.[2] ?? '').trim().toLowerCase();
    const isRectPath =
      /^M-?\d+(\.\d+)?-?\d+(\.\d+)?H-?\d+(\.\d+)?V-?\d+(\.\d+)?H-?\d+(\.\d+)?Z$/.test(d) ||
      /^M0+0+H\d+(\.\d+)?V\d+(\.\d+)?H0+Z$/.test(d);
    const nums = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    const maxNum = nums.length ? Math.max(...nums.map((n) => Math.abs(n))) : 0;
    const isLikelyOuterFrame = isRectPath && maxNum > 700 && (fill === '' || fill === 'none') && stroke !== 'none';
    return isLikelyOuterFrame ? '' : all;
  });
  return output;
}

export function RobotTechnicalDrawing({
  src,
  className,
  color = '#111111',
  title,
  animate = true,
}: RobotTechnicalDrawingProps) {
  const uid = useMemo(() => Math.random().toString(36).slice(2, 10), []);
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 40);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div
      className={`robot-tech-drawing ${animate ? 'robot-tech-drawing--animated' : 'robot-tech-drawing--static'} ${
        mounted ? 'robot-tech-drawing--mounted' : 'robot-tech-drawing--pending'
      } ${className ?? ''}`}
      style={{ color, background: 'transparent' }}
      aria-label={title}
      role="img"
    >
      {failed ? (
        <Image
          src={src}
          alt={title ?? 'Technical drawing'}
          width={1200}
          height={1200}
          className="h-full w-full object-contain"
        />
      ) : (
        <InlineSvgAny
          key={`${src}-${uid}`}
          src={src}
          uniquifyIDs={false}
          preProcessor={(code: string) => {
            const withUniqueIds = uniquifySvgIds(code, uid);
            return cleanupStyles(withUniqueIds);
          }}
          onError={(err: unknown) => {
            console.error('RobotTechnicalDrawing inline svg failed:', src, err);
            setFailed(true);
          }}
          onLoad={() => setFailed(false)}
        />
      )}
    </div>
  );
}
