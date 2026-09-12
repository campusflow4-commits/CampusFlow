import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.jsx';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Tag, 
  User 
} from 'lucide-react';

export const DoubtsPage = () => {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals & form state
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [tags, setTags] = useState('');

  // Active expanded doubt
  const [expandedDoubtId, setExpandedDoubtId] = useState(null);
  const [answerText, setAnswerText] = useState({}); // { doubtId: text }
  const [commentText, setCommentText] = useState({}); // { answerId: text }

  const fetchDoubts = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedCategory !== 'All') query.append('category', selectedCategory);

      const data = await api.get(`/doubts?${query.toString()}`);
      setDoubts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoubts();
  };

  const handlePostDoubt = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doubts', { title, description, category, tags });
      setAskModalOpen(false);
      setTitle('');
      setDescription('');
      setTags('');
      fetchDoubts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePostAnswer = async (doubtId) => {
    const text = answerText[doubtId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/doubts/${doubtId}/answer`, { text });
      setAnswerText(prev => ({ ...prev, [doubtId]: '' }));
      fetchDoubts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpvoteAnswer = async (doubtId, answerId) => {
    try {
      await api.post(`/doubts/${doubtId}/answers/${answerId}/upvote`, {});
      fetchDoubts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (doubtId, answerId) => {
    const text = commentText[answerId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/doubts/${doubtId}/answers/${answerId}/comment`, { text });
      setCommentText(prev => ({ ...prev, [answerId]: '' }));
      fetchDoubts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <HelpCircle size={15} /> Unlimited Student Q&A
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Student <span className="text-gradient">Doubts Forum</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Ask questions, provide peer solutions, upvote helpful explanations, and build your student reputation.
          </p>
        </div>

        <button onClick={() => setAskModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Ask a Doubt
        </button>
      </div>

      {/* Search & Categories Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '28px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search doubts by keyword, tag, or language..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          </div>

          <div style={{ width: '220px' }}>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Python & AI">Python & AI</option>
              <option value="Database & SQL">Database & SQL</option>
              <option value="Computer Networks & OS">Computer Networks & OS</option>
              <option value="Mathematics & Logic">Mathematics & Logic</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '10px 20px' }}>
            Filter
          </button>
        </form>
      </div>

      {/* Doubts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {doubts.map((doubt) => {
          const isExpanded = expandedDoubtId === doubt._id;

          return (
            <div key={doubt._id} className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{doubt.category}</span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{doubt.title}</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={doubt.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${doubt.author?.name}`}
                    alt=""
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{doubt.author?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doubt.author?.year}</p>
                  </div>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px', whiteSpace: 'pre-line' }}>
                {doubt.description}
              </p>

              {doubt.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {doubt.tags.map((tag, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '14px'
              }}>
                <button
                  onClick={() => setExpandedDoubtId(isExpanded ? null : doubt._id)}
                  className="btn btn-secondary btn-sm"
                >
                  <MessageSquare size={14} /> {doubt.answers?.length || 0} Peer Solutions
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Posted {new Date(doubt.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Expanded Solutions Section */}
              {isExpanded && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#a5b4fc' }}>
                    Peer Solutions ({doubt.answers?.length || 0}):
                  </h4>

                  {doubt.answers?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                      {doubt.answers.map((ans) => {
                        const hasUpvoted = ans.upvotes?.includes(user?._id);

                        return (
                          <div key={ans._id} style={{
                            padding: '16px',
                            background: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-md)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <img
                                  src={ans.author?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${ans.author?.name}`}
                                  alt=""
                                  style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                                />
                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ans.author?.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({ans.author?.year})</span>
                              </div>

                              <button
                                onClick={() => handleUpvoteAnswer(doubt._id, ans._id)}
                                className="btn btn-sm"
                                style={{
                                  background: hasUpvoted ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                                  color: hasUpvoted ? '#10b981' : 'var(--text-secondary)',
                                  padding: '4px 10px'
                                }}
                              >
                                <ThumbsUp size={13} /> {ans.upvotes?.length || 0} Helpful
                              </button>
                            </div>

                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '12px' }}>
                              {ans.text}
                            </p>

                            {/* Comments on this answer */}
                            {ans.comments?.length > 0 && (
                              <div style={{ marginLeft: '14px', borderLeft: '2px solid rgba(255,255,255,0.1)', paddingLeft: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                                {ans.comments.map((c, idx) => (
                                  <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{c.author?.name}: </strong>
                                    {c.text}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add a comment */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <input
                                type="text"
                                placeholder="Add a clarification comment..."
                                className="form-input"
                                value={commentText[ans._id] || ''}
                                onChange={(e) => setCommentText(prev => ({ ...prev, [ans._id]: e.target.value }))}
                                style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                              />
                              <button
                                onClick={() => handleAddComment(doubt._id, ans._id)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '6px 12px' }}
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '16px' }}>
                      No solutions posted yet. Be the first student to help!
                    </p>
                  )}

                  {/* Add Answer Box */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      placeholder="Write your solution or explanation to help your peer..."
                      value={answerText[doubt._id] || ''}
                      onChange={(e) => setAnswerText(prev => ({ ...prev, [doubt._id]: e.target.value }))}
                    />
                    <button
                      onClick={() => handlePostAnswer(doubt._id)}
                      className="btn btn-primary btn-sm"
                      style={{ alignSelf: 'flex-end', padding: '8px 18px' }}
                    >
                      <Send size={14} /> Post Solution
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ask Doubt Modal */}
      <Modal
        isOpen={askModalOpen}
        onClose={() => setAskModalOpen(false)}
        title="Ask an Academic or Technical Doubt"
      >
        <form onSubmit={handlePostDoubt}>
          <div className="form-group">
            <label className="form-label">Doubt Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. How does Dijkstra's algorithm handle negative weights?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Web Development">Web Development</option>
              <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
              <option value="Python & AI">Python & AI</option>
              <option value="Database & SQL">Database & SQL</option>
              <option value="Computer Networks & OS">Computer Networks & OS</option>
              <option value="Mathematics & Logic">Mathematics & Logic</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Code Snippet</label>
            <textarea
              required
              rows={4}
              className="form-textarea"
              placeholder="Provide context, what you have tried so far, or paste relevant error outputs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. graphs, algorithms, shortest-path"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            Publish Doubt to Community
          </button>
        </form>
      </Modal>
    </div>
  );
};
