import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.jsx';
import { 
  BrainCircuit, 
  Repeat, 
  Sparkles, 
  Star, 
  GraduationCap, 
  Send, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export const SmartMatchesPage = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Proposal modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/swaps/matches');
        setMatches(res.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const openSwapModal = (match) => {
    setSelectedMatch(match);
    const candidate = match.student;
    setRequestedSkill(match.mutualSkills?.theyTeach?.[0] || candidate.skillsToTeach?.[0] || '');
    setOfferedSkill(match.mutualSkills?.youTeach?.[0] || user?.skillsToTeach?.[0] || '');
    setMessage(`Hi ${candidate.name}! SkillSwap identified a ${match.matchScore}% match between our skills. Would love to swap!`);
    setStatusMsg(null);
    setModalOpen(true);
  };

  const submitProposal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/swaps/request', {
        receiverId: selectedMatch.student._id,
        skillOffered,
        skillRequested,
        message
      });
      setStatusMsg({ type: 'success', text: 'Proposal sent successfully!' });
      setTimeout(() => setModalOpen(false), 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
          <BrainCircuit size={15} /> Algorithmic Skill Compatibility
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Smart <span className="text-gradient">Skill Matches</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '700px' }}>
          Our deterministic compatibility algorithm analyzes what you teach against what peers want to learn, weighting mutual skill overlap, academic pace, and ratings.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Calculating compatibility scores...</p>
      ) : matches.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {matches.map((item, index) => {
            const student = item.student;
            const isTopMatch = item.matchScore >= 85;

            return (
              <div 
                key={student._id} 
                className="glass-card" 
                style={{
                  padding: '24px',
                  border: isTopMatch ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)',
                  background: isTopMatch ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(18, 25, 41, 0.95) 100%)' : 'var(--bg-card)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}>
                  {/* Student Profile Info */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <img
                      src={student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${student.name}`}
                      alt={student.name}
                      style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>{student.name}</h3>
                        <span className="badge badge-primary">{student.year}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {student.college}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#fcd34d', marginTop: '4px', fontWeight: 700 }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{student.rating}</span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({student.totalRatings} ratings)</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      background: isTopMatch ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      boxShadow: 'var(--shadow-md)'
                    }}>
                      <Sparkles size={18} />
                      <span>{item.matchScore}% Match</span>
                    </div>
                  </div>
                </div>

                {/* Compatibility Reasons */}
                <div style={{
                  margin: '18px 0',
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid #6366f1'
                }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#a5b4fc', marginBottom: '6px' }}>
                    WHY YOU MATCH:
                  </p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {item.reasons.map((r, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills tags preview & Action Button */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Teaches:</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#6ee7b7' }}>
                        {student.skillsToTeach?.join(', ') || 'Various'}
                      </span>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '14px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Wants to Learn:</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#a5b4fc' }}>
                        {student.skillsToLearn?.join(', ') || 'Any skill'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openSwapModal(item)}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '10px 20px' }}
                  >
                    <Repeat size={16} /> Request Matched Swap
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card empty-state">
          <BrainCircuit className="empty-state-icon" />
          <h3 style={{ marginBottom: '8px' }}>No matches found yet</h3>
          <p style={{ maxWidth: '480px' }}>
            To generate smart compatibility matches, add the skills you can teach and skills you want to learn in your student profile!
          </p>
          <Link to="/settings" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Update Profile Skills
          </Link>
        </div>
      )}

      {/* Request Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Request Skill Swap with ${selectedMatch?.student.name}`}
      >
        {statusMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '14px',
            background: statusMsg.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
            color: statusMsg.type === 'error' ? '#fb7185' : '#6ee7b7',
            fontSize: '0.85rem'
          }}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={submitProposal}>
          <div className="form-group">
            <label className="form-label">Skill you want to learn (from {selectedMatch?.student.name})</label>
            <input
              type="text"
              required
              className="form-input"
              value={requestedSkill}
              onChange={(e) => setRequestedSkill(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skill you will teach in return</label>
            <input
              type="text"
              required
              className="form-input"
              value={offeredSkill}
              onChange={(e) => setOfferedSkill(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <Send size={16} /> Send Swap Request (+20 Credits on completion)
          </button>
        </form>
      </Modal>
    </div>
  );
};
