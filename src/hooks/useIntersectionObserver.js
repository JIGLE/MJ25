import { useEffect, useRef, useState } from 'react';

export const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, {
      threshold: options.threshold || 0.1,
      rootMargin: options.rootMargin || '0px'
    });

    const current = elementRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        try { observer.unobserve(current); } catch (e) { /* ignore */ }
      }
    };
  }, [options.threshold, options.rootMargin]);

  return [elementRef, isVisible];
};
