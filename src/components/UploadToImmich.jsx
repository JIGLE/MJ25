import React, { useState } from 'react';
import styles from './UploadToImmich.module.css';

export default function UploadToImmich() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return setStatus('Please select a photo');
    setStatus('Starting upload...');

    try {
      const meta = { name: file.name, size: file.size, type: file.type };
      const init = await fetch('/api/immich/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta)
      });
      if (!init.ok) throw new Error('Upload initiation failed');
      const { uploadUrl, assetId } = await init.json();
      setStatus('Uploading file...');
      const put = await fetch(uploadUrl, { method: 'PUT', body: file });
      if (!put.ok) throw new Error('Upload failed');
      await fetch('/api/immich/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      });
      setStatus('Uploaded — pending review');
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus('Upload error');
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label className={styles.fileLabel}>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
        <span>Select a photo…</span>
      </label>
      <button type="submit" className={styles.uploadBtn}>Upload</button>
      <div role="status" className={styles.status}>{status}</div>
    </form>
  );
}
