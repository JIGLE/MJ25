import React, { useEffect, useState } from 'react';
import styles from './GalleryGrid.module.css';

export default function GalleryGrid() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // Ensure we provide an absolute URL when running in Node/test environments
        const base = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost';
        const url = new URL(`/api/gallery?page=${page}`, base).toString();
        const res = await fetch(url);
        if (!res.ok) throw new Error('Gallery fetch failed');
        const json = await res.json();
        if (!mounted) return;
        // if the API returns items use them, otherwise fall back to sample images
        if (page === 1 && (!json.items || json.items.length === 0)) {
          // small set of local placeholder images included in the repo
          const fallback = [
            { id: 'ph-1', previewUrl: '/assets/hero-640.jpg', caption: 'Placeholder photo' },
            { id: 'ph-2', previewUrl: '/assets/hero-1024.jpg', caption: 'Another placeholder' },
          ];
          setItems(fallback);
          setHasMore(false);
        } else {
          setItems(prev => page === 1 ? json.items : prev.concat(json.items));
          setHasMore(json.items.length > 0);
        }
      } catch (e) {
        console.error(e);
        // If the fetch fails (e.g., local dev without API), provide fallback placeholders
        if (mounted && page === 1) {
          setItems([
            { id: 'ph-1', previewUrl: '/assets/hero-640.jpg', caption: 'Placeholder photo' },
            { id: 'ph-2', previewUrl: '/assets/hero-1024.jpg', caption: 'Another placeholder' },
          ]);
          setHasMore(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [page]);

  return (
    <div className={styles.gridWrap}>
      <div className={styles.grid}>
        {items.length === 0 && !loading && <div className={styles.placeholder}>No photos yet.</div>}
        {items.map(item => (
          <article key={item.id} className={styles.masonryItem}>
            <img src={item.previewUrl} alt={item.caption || 'Photo'} loading="lazy" />
            <div className={styles.overlay} />
            {item.caption && <figcaption className={styles.caption}>{item.caption}</figcaption>}
          </article>
        ))}
      </div>

      <div className={styles.actions}>
        {loading ? <div className={styles.loading}>Loading…</div> : null}
        {hasMore && !loading ? (
          <button onClick={() => setPage(p => p + 1)} className={styles.loadMore}>Load more</button>
        ) : null}
      </div>
    </div>
  );
}
