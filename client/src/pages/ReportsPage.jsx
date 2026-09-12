import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { ShieldAlert, Send, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [category, setCategory] = useState('Inappropriate Behavior');
  const [description, setDescription] = useState('');
  const [relatedContent, setRelatedContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchReports = async () => {
    try {
      const data = await api.get('/reports/my-reports');
      setReports(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/reports/submit', {
        category,
        description,
        relatedContent
      });
      setMessage({ type: 'success', text: res.message });
      setDescription('');
      setRelatedContent('');
      fetchReports();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: '820px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div className="badge badge-rose" style={{ marginBottom: '12px' }}>
          <ShieldAlert size={15} /> Community Trust & Safety
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Help & <span className="text-gradient">Dispute Reporting</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          CampusFlow is dedicated to maintaining a safe, respectful learning environment for all students.
        </p>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          background: message.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
          color: message.type === 'error' ? '#fb7185' : '#6ee7b7',
          fontSize: '0.9rem'
        }}>
          {message.text}
        </div>
      )}

      {/* Report Form */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '36px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Submit a Confidential Report</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Issue Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Inappropriate Behavior">Inappropriate Behavior</option>
              <option value="No-Show for Swap Session">No-Show for Swap Session</option>
              <option value="Spam or Harassment">Spam or Harassment</option>
              <option value="Misleading Skill Info">Misleading Skill Info</option>
              <option value="Technical Glitch / Bug">Technical Glitch / Bug</option>
              <option value="Other">Other Community Grievance</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Incident Description & Context</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              placeholder="Describe what occurred, including dates, chat context, or skill swap details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Related Student Name / Link (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Aarav Sharma or Skill Swap Python Session"
              value={relatedContent}
              onChange={(e) => setRelatedContent(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '12px 24px', marginTop: '6px' }}
          >
            <Send size={16} /> {submitting ? 'Submitting Report...' : 'File Confidential Report'}
          </button>
        </form>
      </div>

      {/* Submitted Reports History */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Your Filed Reports ({reports.length})</h3>

        {reports.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reports.map((report) => (
              <div key={report._id} style={{
                padding: '16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{report.category}</span>
                  <span className={`badge ${report.status === 'Resolved' ? 'badge-emerald' : report.status === 'Reviewing' ? 'badge-amber' : 'badge-primary'}`}>
                    {report.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {report.description}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Filed on {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            You have no active reports on record.
          </p>
        )}
      </div>
    </div>
  );
};
