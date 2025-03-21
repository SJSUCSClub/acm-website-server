import clsx, { ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'accent',
        'background',
        'text',
        'neutral',
        'important',
        'highlight',
        'good',
        'ok',
        'bad',
        'border',
        'hovered-border',
      ],
      borderRadius: ['lg', 'md', 'sm', 'none'],
      spacing: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'content-width'],
    },
    classGroups: {
      'font-size': [
        {
          text: [
            'h1-mobile-lg',
            'h1-mobile-sm',
            'h2-mobile',
            'h3-mobile',
            'h4-mobile',
            'h5-mobile',
            'h6-mobile',
            'h1-desktop-lg',
            'h1-desktop-sm',
            'h2-desktop',
            'h3-desktop',
            'h4-desktop',
            'h5-desktop',
            'h6-desktop',
            'button',
            'p',
            'small-lg',
            'small-lg-bold',
            'small-sm',
            'small-sm-bold',
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
