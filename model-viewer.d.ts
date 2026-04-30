import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        loading?: 'auto' | 'eager' | 'lazy';
        reveal?: 'auto' | 'interaction' | 'manual';
        'camera-controls'?: boolean | '';
        'auto-rotate'?: boolean | '';
        'auto-rotate-delay'?: string;
        'rotation-per-second'?: string;
        'disable-zoom'?: boolean | '';
        'interaction-prompt'?: string;
        'touch-action'?: string;
        'camera-orbit'?: string;
        'camera-target'?: string;
        'field-of-view'?: string;
        'environment-image'?: string;
        'environment-intensity'?: string;
        exposure?: string;
        'shadow-intensity'?: string;
        'shadow-softness'?: string;
      };
    }
  }
}

export {};
