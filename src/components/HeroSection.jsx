import React, { useEffect, useRef } from 'react';
import styles from './HeroSection.module.css';

// Responsive hero with picture/srcset and lazy-loading. Parallax is applied
// to the image wrapper on desktop only and respects prefers-reduced-motion.
const generatedManifest = null;

export default function HeroSection({
  title = 'Marlene & Jose',
  date = 'September 13, 2025',
  // Accept object or string for backward compatibility
  images = {
    // Replace these files with your custom hero image(s) placed in public/assets
    // If you only provide one image, place it at /public/assets/hero-custom.jpg
    small: '/assets/hero-custom.jpg',
    medium: '/assets/hero-custom.jpg',
    large: '/assets/hero-custom.jpg',
  },
}) {
  const imgWrapperRef = useRef(null);
  // Background control state (persisted)
  const [showControls, setShowControls] = React.useState(false);
  const [bgFit, setBgFit] = React.useState(() => localStorage.getItem('hero:bgFit') || 'cover');
  const [bgPosX, setBgPosX] = React.useState(() => localStorage.getItem('hero:bgPosX') || '50%');
  const [bgPosY, setBgPosY] = React.useState(() => localStorage.getItem('hero:bgPosY') || '50%');
  const [bgScale, setBgScale] = React.useState(() => parseFloat(localStorage.getItem('hero:bgScale')) || 1);

  React.useEffect(() => {
    localStorage.setItem('hero:bgFit', bgFit);
    localStorage.setItem('hero:bgPosX', bgPosX);
    localStorage.setItem('hero:bgPosY', bgPosY);
    localStorage.setItem('hero:bgScale', String(bgScale));
  }, [bgFit, bgPosX, bgPosY, bgScale]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (imgWrapperRef.current) imgWrapperRef.current.style.transform = 'translateY(0)';
      return;
    }

    // If matchMedia isn't available (older browsers / test env), skip parallax
    const hasMatchMedia = typeof window.matchMedia === 'function';
    if (!hasMatchMedia) {
      return undefined;
    }

    const mq = window.matchMedia('(min-width: 768px)');
    let enabled = mq.matches;
    let rafId = null;
    let lastScrollY = window.scrollY || 0;

    function onScroll() {
      lastScrollY = window.scrollY || 0;
      if (!enabled) return;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          const offset = Math.round(-lastScrollY * 0.22);
          if (imgWrapperRef.current) imgWrapperRef.current.style.transform = `translateY(${offset}px)`;
          rafId = null;
        });
      }
    }

    function onChange() {
      enabled = mq.matches;
      if (!enabled && imgWrapperRef.current) imgWrapperRef.current.style.transform = 'translateY(0)';
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else if (typeof mq.addListener === 'function') mq.addListener(onChange);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange);
      else if (typeof mq.removeListener === 'function') mq.removeListener(onChange);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const small = typeof images === 'string' ? images : images.small;
  const medium = typeof images === 'string' ? images : images.medium;
  const large = typeof images === 'string' ? images : images.large;

  // If a generated manifest exists, prefer hashed assets
  const hasManifest = generatedManifest && generatedManifest.avif && generatedManifest.jpg;
  const getSrc = (fmt, w) => {
    if (hasManifest && generatedManifest[fmt] && generatedManifest[fmt][w]) return generatedManifest[fmt][w];
    // fallback mapping from jpg filenames
    const map = { avif: (s) => s.replace(/\.jpg$/, '.avif'), webp: (s) => s.replace(/\.jpg$/, '.webp'), jpg: (s) => s };
    if (fmt === 'jpg') {
      if (w === 1920) return large;
      if (w === 1024) return medium;
      return small;
    }
    if (fmt === 'webp') return map.webp(w === 1920 ? large : w === 1024 ? medium : small);
    return map.avif(w === 1920 ? large : w === 1024 ? medium : small);
  };

  return (
    <section className={styles.heroSection} aria-label="Hero">
      <div ref={imgWrapperRef} className={styles.heroImgWrapper} aria-hidden="true">
        <picture>
          {/* AVIF first */}
          <source
            type="image/avif"
            media="(min-width:1200px)"
            srcSet={`${getSrc('avif', 1920)} 1920w, ${getSrc('avif', 1024)} 1024w`}
          />
          <source type="image/avif" media="(min-width:640px)" srcSet={`${getSrc('avif', 1024)} 1024w, ${getSrc('avif', 640)} 640w`} />

          {/* WebP fallback */}
          <source
            type="image/webp"
            media="(min-width:1200px)"
            srcSet={`${getSrc('webp', 1920)} 1920w, ${getSrc('webp', 1024)} 1024w`}
          />
          <source type="image/webp" media="(min-width:640px)" srcSet={`${getSrc('webp', 1024)} 1024w, ${getSrc('webp', 640)} 640w`} />

          {/* JPEG fallback */}
          <source media="(min-width:1200px)" srcSet={`${getSrc('jpg', 1920)} 1920w, ${getSrc('jpg', 1024)} 1024w`} />
          <source media="(min-width:640px)" srcSet={`${getSrc('jpg', 1024)} 1024w, ${getSrc('jpg', 640)} 640w`} />

          <img
            className={styles.heroImg}
            src={small}
            srcSet={`${small} 640w, ${medium} 1024w, ${large} 1920w`}
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 100vw, 1920px"
            loading="lazy"
            alt="Hero background"
            style={{ objectFit: bgFit, objectPosition: `${bgPosX} ${bgPosY}`, transform: `scale(${bgScale})` }}
          />
        </picture>

        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroInner}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.dateText}>{date}</p>

          {/* buttons intentionally removed for a minimal hero */}
        </div>

        {/* Controls toggle + panel (hidden by default) */}
        <button className={styles.controlToggle} onClick={() => setShowControls(s => !s)} aria-expanded={showControls} aria-label="Toggle background controls">⚙️</button>
        {showControls ? (
          <div className={styles.controlsPanel} role="region" aria-label="Background controls">
            <label>Fit</label>
            <select value={bgFit} onChange={e => setBgFit(e.target.value)}>
              <option value="cover">cover</option>
              <option value="contain">contain</option>
              <option value="auto">auto</option>
            </select>

            <label style={{marginTop:8}}>Position X</label>
            <input type="range" min="0" max="100" value={parseInt(bgPosX)} onChange={e => setBgPosX(e.target.value + '%')} />

            <label>Position Y</label>
            <input type="range" min="0" max="100" value={parseInt(bgPosY)} onChange={e => setBgPosY(e.target.value + '%')} />

            <label>Scale</label>
            <input type="range" min="0.6" max="1.6" step="0.01" value={bgScale} onChange={e => setBgScale(parseFloat(e.target.value))} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
