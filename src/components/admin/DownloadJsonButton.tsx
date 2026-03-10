'use client';

import { FileDown } from 'lucide-react';

export default function DownloadJsonButton() {
  async function download() {
    const res = await fetch('/api/admin/data', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <button type="button" className="btn btn--secondary" onClick={download}>
      <FileDown size={18} style={{ marginRight: 6 }} />
      Baixar data.json atual
    </button>
  );
}
