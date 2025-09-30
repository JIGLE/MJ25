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
        const res = await fetch(`/api/gallery?page=${page}`);
        if (!res.ok) throw new Error('Gallery fetch failed');
        const json = await res.json();
        if (!mounted) return;
        setItems(prev => page === 1 ? json.items : prev.concat(json.items));
        setHasMore(json.items.length > 0);
      } catch (e) {
        console.error(e);
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
          <figure key={item.id} className={styles.card}>
            <img src={item.previewUrl} alt={item.caption || 'Wedding photo'} loading="lazy" />
            {item.caption && <figcaption>{item.caption}</figcaption>}
          </figure>
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
