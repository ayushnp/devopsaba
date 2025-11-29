import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';

const CourseMaterials = () => {
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ course_code: '', course_name: '', semester: '', academic_year: '' });
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/faculty/courses');
      setUploads(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }
    if (!form.course_name && !form.course_code) {
      alert('Please enter course name');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('materials', file));
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      const { data } = await api.post('/faculty/courses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploads((prev) => [data, ...prev]);
      setFiles([]);
      setForm({ course_code: '', course_name: '', semester: '', academic_year: '' });
      alert('Course materials uploaded successfully!');
      fetchCourses(); // Refresh list
    } catch (err) {
      console.error('Course upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload course materials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Course Materials</h2>
          <p className="text-sm text-slate-500">Share syllabus, notes & notifications</p>
        </div>
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
      </header>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Course Code (optional)"
          value={form.course_code}
          onChange={(e) => setForm((prev) => ({ ...prev, course_code: e.target.value }))}
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Course Name *"
          value={form.course_name}
          onChange={(e) => setForm((prev) => ({ ...prev, course_name: e.target.value }))}
          required
        />
        <input
          type="number"
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Semester (optional)"
          value={form.semester}
          onChange={(e) => setForm((prev) => ({ ...prev, semester: e.target.value }))}
        />
        <input
          className="rounded border border-slate-200 px-3 py-2"
          placeholder="Academic Year (optional)"
          value={form.academic_year}
          onChange={(e) => setForm((prev) => ({ ...prev, academic_year: e.target.value }))}
        />
      </div>
      <button
        type="button"
        className="mt-4 rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        onClick={handleUpload}
        disabled={!files.length || !form.course_name || loading}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      <ul className="mt-4 space-y-2 text-sm text-slate-500">
        {uploads.map((upload) => (
          <li key={upload.course_id}>
            {upload.course_code} · {upload.course_name} ({upload.materials?.length || 0} files)
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CourseMaterials;


