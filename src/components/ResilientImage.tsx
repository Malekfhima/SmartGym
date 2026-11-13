import { useState } from 'react';
import { Flag } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({ src, alt, className = '', fallbackTitle }: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0F5C45]/20 via-[#1E3A2F]/15 to-[#D95D39]/15 dark:from-[#0F5C45]/30 dark:via-[#12221B] dark:to-[#1F2D27] text-[#0F5C45] dark:text-emerald-300 p-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Flag className="w-7 h-7 mb-2 opacity-80" />
        {fallbackTitle && (
          <span className="text-xs font-medium text-center text-[#141C18]/75 dark:text-slate-200/80 line-clamp-1">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
