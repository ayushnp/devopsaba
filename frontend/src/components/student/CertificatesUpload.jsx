import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const CertificatesUpload = () => {
  const [files, setFiles] = useState([]);
  const [meta, setMeta] = useState({ certificate_type: '', competition: '', internship: '', workshop: '' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await api.get('/student/certificates');
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    }
  };

  const upload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }
    if (!meta.certificate_type) {
      alert('Please enter certificate type');
      return;
    }
    setLoading(true);
    try {
      const payloads = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('certificate', file);
        Object.entries(meta).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });
        const { data } = await api.post('/student/certificates', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data;
      });
      const results = await Promise.all(payloads);
      setHistory((prev) => [...results, ...prev]);
      setFiles([]);
      setMeta({ certificate_type: '', competition: '', internship: '', workshop: '' });
      alert(`${results.length} certificate(s) uploaded successfully!`);
      fetchCertificates(); // Refresh list
    } catch (err) {
      console.error('Certificate upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload certificates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Certificates</h2>
          <p className="text-sm text-slate-500">Upload achievements and workshops</p>
        </div>
        <button
          type="button"
          className="rounded border border-slate-200 px-3 py-1 text-sm"
          onClick={() => document.getElementById('cert-upload').click()}
        >
          Select files
        </button>
        <input
          id="cert-upload"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFiles(e.target.files)}
        />
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Certificate Type *"
          value={meta.certificate_type}
          onChange={(e) => setMeta((prev) => ({ ...prev, certificate_type: e.target.value }))}
          required
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Competition"
          value={meta.competition}
          onChange={(e) => setMeta((prev) => ({ ...prev, competition: e.target.value }))}
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Internship"
          value={meta.internship}
          onChange={(e) => setMeta((prev) => ({ ...prev, internship: e.target.value }))}
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Workshop"
          value={meta.workshop}
          onChange={(e) => setMeta((prev) => ({ ...prev, workshop: e.target.value }))}
        />
      </div>
      <button
        type="button"
        className="mt-4 rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        onClick={upload}
        disabled={!files.length || !meta.certificate_type || loading}
      >
        {loading ? 'Uploading...' : `Upload ${files.length ? `(${files.length})` : ''}`}
      </button>
      <ul className="mt-4 space-y-2 text-sm text-slate-500">
        {history.map((item) => (
          <li key={item.certificate_id}>Uploaded {item.certificate_type}</li>
        ))}
      </ul>
    </section>
  );
};

export default CertificatesUpload;


