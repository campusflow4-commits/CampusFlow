import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { 
  Coins, 
  Flame, 
  Star, 
  Repeat, 
  CheckSquare, 
  Calendar, 
  Clock, 
  Video, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Play
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';

export const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const [plannerSummary, setPlannerSummary] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [videoStats, setVideoStats] = useState(null);
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [plannerRes, statsRes, videoRes, matchesRes] = await Promise.all([
          api.get('/planner/summary').catch(() => null),
          api.get('/stats/progress').catch(() => null),
          api.get('/videos').catch(() => null),
          api.get('/swaps/matches').catch(() => ({ matches: [] }))
        ]);

        setPlannerSummary(plannerRes);
        setProgressStats(statsRes);
        setVideoStats(videoRes);
        setRecommendedStudents(matchesRes.matches ? matchesRes.matches.slice(0, 3) : []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleToggleTodo = async (todoId, currentStatus) => {
    try {
      await api.put(`/planner/todos/${todoId}`, { completed: !currentStatus });
      setPlannerSummary(prev => ({
        ...prev,
        todos: prev.todos.map(t => t._id === todoId ? { ...t, completed: !currentStatus } : t)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const trialDays = user?.trialDaysRemaining ?? 7;

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Free Trial Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#6366f1',
            borderRadius: 'var(--radius-full)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              CampusFlow 7-Day Free Trial: <span style={{ color: '#a5b4fc' }}>{trialDays} {trialDays === 1 ? 'day' : 'days'} remaining</span>
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Enjoy unrestricted skill swaps, unlimited doubt queries, and curated video masterclasses.
            </p>
          </div>
        </div>
        <Link to="/swaps" className="btn btn-primary btn-sm">
          Browse Skills <ArrowRight size={14} />
        </Link>
      </div>

      {/* Welcome Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Welcome back, <span className="text-gradient">{user?.name}</span>!
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            {user?.year} • {user?.college}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/swaps" className="btn btn-primary btn-sm">
            <Repeat size={16} /> Request Skill Swap
          </Link>
          <Link to="/doubts" className="btn btn-secondary btn-sm">
            Ask a Doubt
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Credit Balance</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
              <Coins size={18} color="#f59e0b" />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fcd34d' }}>{user?.credits || 50}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+20 earned per completed swap</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Peer Rating</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{user?.rating || 5.0}★</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({user?.totalRatings || 0} reviews)</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Community verified learner</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Daily Streak</span>
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
              <Flame size={18} color="#f43f5e" />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fb7185' }}>{user?.currentStreak || 1} Days</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Keep learning daily!</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Skills In Profile</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
              <Repeat size={18} color="#818cf8" />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a5b4fc' }}>
            {(user?.skillsToTeach?.length || 0) + (user?.skillsToLearn?.length || 0)}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.skillsToTeach?.length || 0} teaching • {user?.skillsToLearn?.length || 0} learning
          </span>
        </div>
      </div>

      {/* Feature 9: Video Reward Progress Card */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Video size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.15rem' }}>5-Video Educational Milestone Reward</h3>
          </div>
          <Link to="/videos" className="btn btn-emerald btn-sm">
            <Play size={14} /> Watch Videos
          </Link>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Watch 5 skill-building videos to claim a <strong style={{ color: '#fcd34d' }}>+50 credits bonus</strong>!
        </p>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.min(100, ((videoStats?.totalWatched || 0) / 5) * 100)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            transition: 'width 0.4s ease'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>Progress: {videoStats?.totalWatched || 0} of 5 completed</span>
          <span>{videoStats?.rewardClaimed ? '✅ Reward Claimed (+50 Credits)' : `${Math.max(0, 5 - (videoStats?.totalWatched || 0))} more to unlock reward`}</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '28px' }}>
        {/* Left Column: Progress Graph & Recommended Swaps */}
        <div>
          {/* Recharts Learning Progression Graph */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Learning & Skill Progress Graph</h3>
              <span className="badge badge-primary">Past 6 Months</span>
            </div>

            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressStats?.monthlySkillGrowth || [
                  { month: 'Apr', skillsLearned: 1, skillsTaught: 0, creditsEarned: 30 },
                  { month: 'May', skillsLearned: 2, skillsTaught: 1, creditsEarned: 50 },
                  { month: 'Jun', skillsLearned: 3, skillsTaught: 2, creditsEarned: 70 },
                  { month: 'Jul', skillsLearned: 4, skillsTaught: 2, creditsEarned: 85 },
                  { month: 'Aug', skillsLearned: 5, skillsTaught: 3, creditsEarned: 110 },
                  { month: 'Sep', skillsLearned: 6, skillsTaught: 4, creditsEarned: 140 }
                ]}>
                  <defs>
                    <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: '#121929', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="skillsLearned" stroke="#6366f1" fillOpacity={1} fill="url(#colorSkills)" name="Skills Learned" />
                  <Area type="monotone" dataKey="creditsEarned" stroke="#10b981" fillOpacity={1} fill="url(#colorCredits)" name="Credits Earned" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Skill Matches */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Recommended Skill Partners</h3>
              <Link to="/matches" style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 600 }}>
                View All Matches →
              </Link>
            </div>

            {recommendedStudents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recommendedStudents.map((match, idx) => (
                  <div key={idx} style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={match.student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${match.student.name}`}
                        alt={match.student.name}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700 }}>{match.student.name}</span>
                          <span className="badge badge-primary">{match.matchScore}% Match</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Teaches: <strong>{match.student.skillsToTeach?.join(', ') || 'Various'}</strong>
                        </p>
                      </div>
                    </div>
                    <Link to="/swaps" className="btn btn-primary btn-sm">
                      Swap <Repeat size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Repeat className="empty-state-icon" />
                <p>Add skills to your profile to receive smart partner recommendations!</p>
                <Link to="/settings" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                  Update Skills
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Planner, Deadlines, & Practicals */}
        <div>
          {/* Today's Timetable */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#8b5cf6" />
                <h3 style={{ fontSize: '1.15rem' }}>Timetable ({plannerSummary?.todayName || 'Today'})</h3>
              </div>
              <Link to="/planner" style={{ fontSize: '0.8rem', color: '#818cf8' }}>Full Week →</Link>
            </div>

            {plannerSummary?.todayClasses && plannerSummary.todayClasses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plannerSummary.todayClasses.map((c, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    borderLeft: `4px solid ${c.color || '#6366f1'}`,
                    background: 'var(--bg-surface)',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                  }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.subject}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.startTime} - {c.endTime} • {c.room}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No classes scheduled for today. Great time for a skill swap!
              </p>
            )}
          </div>

          {/* Upcoming Deadlines */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#f43f5e" />
                <h3 style={{ fontSize: '1.15rem' }}>Upcoming Deadlines</h3>
              </div>
              <Link to="/planner" style={{ fontSize: '0.8rem', color: '#818cf8' }}>Manage →</Link>
            </div>

            {plannerSummary?.deadlines && plannerSummary.deadlines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plannerSummary.deadlines.map((d, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.88rem' }}>{d.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.subject}</p>
                    </div>
                    <span className="badge badge-rose">
                      {new Date(d.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No impending deadlines. You're all caught up!
              </p>
            )}
          </div>

          {/* Student Todo List */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={18} color="#10b981" />
                <h3 style={{ fontSize: '1.15rem' }}>Student Todo List</h3>
              </div>
              <Link to="/planner" style={{ fontSize: '0.8rem', color: '#818cf8' }}>View All →</Link>
            </div>

            {plannerSummary?.todos && plannerSummary.todos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {plannerSummary.todos.map((t, i) => (
                  <div
                    key={i}
                    onClick={() => handleToggleTodo(t._id, t.completed)}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => {}}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{
                      fontSize: '0.88rem',
                      textDecoration: t.completed ? 'line-through' : 'none',
                      color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {t.title}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No active todos. Add your study goals in Planner.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
