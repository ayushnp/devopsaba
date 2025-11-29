import { useState } from 'react';
import { api } from '../../api/client.js';

const FeedbackForm = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [messages, setMessages] = useState([]);

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post('/student/feedback', { feedback, rating });
    setMessages((prev) => [data, ...prev]);
    setFeedback('');
    setRating(5);
  };

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Feedback</h2>
        <p className="text-sm text-slate-500">Share feedback with department</p>
      </header>
      <form className="space-y-3" onSubmit={submit}>
        <textarea
          className="w-full rounded border border-slate-200 px-3 py-2"
          placeholder="Write feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          required
        />
        <label className="flex items-center gap-3 text-sm">
          Rating
          <input
            type="range"
            min="1"
            max="10"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <span className="font-semibold">{rating}</span>
        </label>
        <button type="submit" className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white">
          Submit feedback
        </button>
      </form>
      <div className="mt-4 space-y-2 text-sm text-slate-600">
        {messages.map((item) => (
          <div key={item.feedback_id} className="rounded border border-slate-200 p-3">
            <p>{item.feedback}</p>
            <span className="text-xs text-slate-500">Rating {item.rating}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeedbackForm;


