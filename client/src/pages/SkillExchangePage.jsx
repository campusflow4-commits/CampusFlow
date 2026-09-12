import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.jsx';
import { 
  Repeat, 
  Search, 
  Star, 
  Check, 
  X, 
  MessageSquare, 
  Sparkles, 
  Send, 
  Award, 
  Filter, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

export const SkillExchangePage = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'swaps'
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minRating, setMinRating] = useState('');

  // Swap Requests state
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  // Modals
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);

  // Rating Modal
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [swapToRate, setSwapToRate] = useState(null);
  const [stars, setStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedYear !== 'All') queryParams.append('year', selectedYear);
      if (minRating) queryParams.append('minRating', minRating);

      const [studentsRes, requestsRes] = await Promise.all([
        api.get(`/swaps/explore?${queryParams.toString()}`),
        api.get('/swaps/my-requests')
      ]);

      setStudents(studentsRes);
      setIncoming(requestsRes.incoming || []);
      setOutgoing(requestsRes.outgoing || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedYear, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const openRequestModal = (student) => {
    setSelectedStudent(student);
    setRequestedSkill(student.skillsToTeach?.[0] || '');
    setOfferedSkill(user?.skillsToTeach?.[0] || '');
    setProposalMessage('Hi! I saw your profile on SkillSwap and would love to exchange skills.');
    setModalFeedback(null);
    setRequestModalOpen(true);
  };

  const submitSwapRequest = async (e) => {
    e.preventDefault();
    if (!offeredSkill || !requestedSkill) {
      setModalFeedback({ type: 'error', message: 'Please select or type both skills.' });
      return;
    }

    setSendingRequest(true);
    try {
      await api.post('/swaps/request', {
        receiverId: selectedStudent._id,
        skillOffered: offeredSkill,
        skillRequested: requestedSkill,
        message: proposalMessage
      });

      setModalFeedback({ type: 'success', message: 'Skill swap proposal sent successfully!' });
      refreshUser();
      loadData();
      setTimeout(() => setRequestModalOpen(false), 1500);
    } catch (err) {
      setModalFeedback({ type: 'error', message: err.message });
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAcceptRequest = async (swapId) => {
    try {
      await api.put(`/swaps/${swapId}/accept`, {});
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectRequest = async (swapId) => {
    try {
      await api.put(`/swaps/${swapId}/reject`, {});
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCompleteSwap = async (swapId) => {
    try {
      const res = await api.put(`/swaps/${swapId}/complete`, {});
      alert(res.message);
      refreshUser();
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const submitRating = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/swaps/${swapToRate._id}/rate`, {
        stars,
        comment: ratingComment
      });
      alert('Thank you! Rating submitted successfully.');
      setRatingModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Skill <span className="text-gradient">Exchange</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Find students who know what you want to learn, and teach them what you know best.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('browse')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'browse' ? '#6366f1' : 'none',
              color: activeTab === 'browse' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            Browse Skills ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('swaps')}
            className="btn btn-sm"
            style={{
              background: activeTab === 'swaps' ? '#6366f1' : 'none',
              color: activeTab === 'swaps' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            My Swaps ({incoming.length + outgoing.length})
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '28px' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 260px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search by skill (e.g. Python, UI/UX, React)..."
                  className="form-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>

              <div style={{ width: '160px' }}>
                <select
                  className="form-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="All">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div style={{ width: '150px' }}>
                <select
                  className="form-select"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.8">4.8+ Stars</option>
                  <option value="5.0">5.0 Stars</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '10px 18px' }}>
                Search
              </button>
            </form>
          </div>

          {/* Student Skill Cards Grid */}
          {students.length > 0 ? (
            <div className="grid-3">
              {students.map((student) => (
                <div key={student._id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  {/* Student Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <img
                      src={student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`}
                      alt={student.name}
                      style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.15rem' }}>{student.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span className="badge badge-primary">{student.year}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem', color: '#fcd34d', fontWeight: 700 }}>
                          <Star size={13} fill="#f59e0b" color="#f59e0b" /> {student.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1, minHeight: '40px' }}>
                    {student.bio || 'Student passionate about sharing skills with peers.'}
                  </p>

                  {/* Skills Section */}
                  <div style={{ marginBottom: '14px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Can Teach:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {student.skillsToTeach?.length > 0 ? (
                        student.skillsToTeach.map((skill, idx) => (
                          <span key={idx} className="badge badge-emerald">{skill}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Open to explore</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Wants to Learn:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {student.skillsToLearn?.length > 0 ? (
                        student.skillsToLearn.map((skill, idx) => (
                          <span key={idx} className="badge badge-primary">{skill}</span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Any skill</span>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => openRequestModal(student)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                  >
                    <Repeat size={16} /> Request Skill Swap
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state glass-card">
              <Repeat className="empty-state-icon" />
              <h3 style={{ marginBottom: '6px' }}>No students found</h3>
              <p>Try clearing your search query or adjusting your year filter.</p>
            </div>
          )}
        </>
      ) : (
        /* My Swaps Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Incoming Requests */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
              Incoming Swap Requests ({incoming.filter(s => s.status === 'pending').length} Pending)
            </h3>

            {incoming.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {incoming.map((swap) => (
                  <div key={swap._id} style={{
                    padding: '16px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={swap.sender?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${swap.sender?.name}`}
                        alt=""
                        style={{ width: '44px', height: '44px', borderRadius: '50%' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700 }}>{swap.sender?.name}</span>
                          <span className={`badge ${swap.status === 'accepted' ? 'badge-emerald' : swap.status === 'pending' ? 'badge-amber' : 'badge-primary'}`}>
                            {swap.status.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Offers: <strong style={{ color: '#6ee7b7' }}>{swap.skillOffered}</strong> ⇄ Wants: <strong style={{ color: '#a5b4fc' }}>{swap.skillRequested}</strong>
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                          "{swap.message}"
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {swap.status === 'pending' && (
                        <>
                          <button onClick={() => handleAcceptRequest(swap._id)} className="btn btn-emerald btn-sm">
                            <Check size={14} /> Accept
                          </button>
                          <button onClick={() => handleRejectRequest(swap._id)} className="btn btn-danger btn-sm">
                            <X size={14} /> Decline
                          </button>
                        </>
                      )}
                      {swap.status === 'accepted' && (
                        <button onClick={() => handleCompleteSwap(swap._id)} className="btn btn-primary btn-sm">
                          <CheckCircle size={14} /> Complete & Earn Credits (+20)
                        </button>
                      )}
                      {swap.status === 'completed' && !swap.ratingByReceiver?.stars && (
                        <button onClick={() => { setSwapToRate(swap); setRatingModalOpen(true); }} className="btn btn-amber btn-sm">
                          <Star size={14} fill="#fff" /> Rate Student
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No incoming swap requests yet.</p>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Sent Proposals ({outgoing.length})</h3>

            {outgoing.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {outgoing.map((swap) => (
                  <div key={swap._id} style={{
                    padding: '16px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>Sent to {swap.receiver?.name}</span>
                      <span className={`badge ${swap.status === 'accepted' ? 'badge-emerald' : swap.status === 'pending' ? 'badge-amber' : 'badge-primary'}`} style={{ marginLeft: '10px' }}>
                        {swap.status.toUpperCase()}
                      </span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        You Offered: <strong>{swap.skillOffered}</strong> ⇄ You Wanted: <strong>{swap.skillRequested}</strong>
                      </p>
                    </div>

                    <div>
                      {swap.status === 'completed' && !swap.ratingBySender?.stars && (
                        <button onClick={() => { setSwapToRate(swap); setRatingModalOpen(true); }} className="btn btn-amber btn-sm">
                          <Star size={14} fill="#fff" /> Rate Experience
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>You have not sent any swap proposals yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Proposal Modal */}
      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title={`Swap Skills with ${selectedStudent?.name}`}
      >
        {modalFeedback && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '14px',
            background: modalFeedback.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
            color: modalFeedback.type === 'error' ? '#fb7185' : '#6ee7b7',
            fontSize: '0.85rem'
          }}>
            {modalFeedback.message}
          </div>
        )}

        <form onSubmit={submitSwapRequest}>
          <div className="form-group">
            <label className="form-label">Skill You Want to Learn (from {selectedStudent?.name})</label>
            <input
              type="text"
              required
              className="form-input"
              value={requestedSkill}
              onChange={(e) => setRequestedSkill(e.target.value)}
              placeholder="e.g. Python, UI/UX"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skill You Can Teach in Return</label>
            <input
              type="text"
              required
              className="form-input"
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
              placeholder="e.g. Figma, Web Development"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Introduction Note</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={proposalMessage}
              onChange={(e) => setProposalMessage(e.target.value)}
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            💡 Completing this swap will award both of you <strong style={{ color: '#fcd34d' }}>+20 SkillSwap credits</strong>!
          </p>

          <button
            type="submit"
            disabled={sendingRequest}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {sendingRequest ? 'Sending Proposal...' : <><Send size={16} /> Send Swap Proposal</>}
          </button>
        </form>
      </Modal>

      {/* Peer Rating Modal */}
      <Modal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        title="Rate Your Swap Experience"
      >
        <form onSubmit={submitRating}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
              How helpful and engaging was your peer study session?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStars(s)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transform: stars >= s ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <Star
                    size={32}
                    color={stars >= s ? '#f59e0b' : '#475569'}
                    fill={stars >= s ? '#f59e0b' : 'none'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Written Feedback (Optional)</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Excellent explanations, very patient with coding questions!"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-amber" style={{ width: '100%', padding: '12px' }}>
            Submit 5★ Rating
          </button>
        </form>
      </Modal>
    </div>
  );
};
