import React, { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackText = 'ছবি লোড করা যায়নি',
  ...rest
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (!src || hasError) {
    return (
      <div 
        className={`bg-slate-100 border border-slate-200/80 rounded-xl flex flex-col items-center justify-center text-slate-400 p-4 min-h-[140px] text-center ${containerClassName}`}
      >
        <ImageOff className="w-8 h-8 text-slate-300 mb-1" />
        <span className="text-[11px] font-medium text-slate-500">{fallbackText}</span>
        <span className="text-[10px] text-slate-400">সাভার সার্ভিস হাব মিডিয়া গার্ড</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center animate-pulse">
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt || 'Savar Service Hub'}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...rest}
      />
    </div>
  );
};
