import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { 
  Coins, 
  Flame, 
  Star, 
  ArrowLeftRight, 
  CheckSquare, 
  CalendarDays, 
  Clock, 
  PlayCircle, 
  Sparkles, 
  HelpCircle,
  BarChart3,
  TrendingUp,
  Award
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
  Bar,
  Legend
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [plannerSummary, setPlannerSummary] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [videoStats, setVideoStats] = useState(null);
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [_loading, setLoading] = useState(true);

  // Graph Horizontal 3-Tab State
  const [graphTab, setGraphTab] = useState('progress'); // 'progress' | 'activity' | 'goals'

  // Productivity Right Column 3-Tab State
  const [productivityTab, setProductivityTab] = useState('timetable'); // 'timetable' | 'deadlines' | 'todos'

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
        todos: prev?.todos?.map(t => t._id === todoId ? { ...t, completed: !currentStatus } : t)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const trialDays = user?.trialDaysRemaining ?? 7;

  // Real chart data fallback
  const monthlyData = progressStats?.monthlySkillGrowth || [
    { month: 'Apr', skillsLearned: 1, skillsTaught: 0, creditsEarned: 30, quizzesTaken: 1 },
    { month: 'May', skillsLearned: 2, skillsTaught: 1, creditsEarned: 50, quizzesTaken: 2 },
    { month: 'Jun', skillsLearned: 3, skillsTaught: 2, creditsEarned: 70, quizzesTaken: 3 },
    { month: 'Jul', skillsLearned: 4, skillsTaught: 2, creditsEarned: 85, quizzesTaken: 3 },
    { month: 'Aug', skillsLearned: 5, skillsTaught: 3, creditsEarned: 110, quizzesTaken: 4 },
    { month: 'Sep', skillsLearned: 6, skillsTaught: 4, creditsEarned: 140, quizzesTaken: 5 }
  ];

  const categoryData = progressStats?.categoryDistribution || [
    { name: 'Web Dev', value: 40, color: '#6366f1' },
    { name: 'Python & AI', value: 25, color: '#8b5cf6' },
    { name: 'Data Structures', value: 20, color: '#10b981' },
    { name: 'UI/UX Design', value: 15, color: '#f59e0b' }
  ];

  return (
    <div className="container" style={{ padding: '24px 20px' }}>
      {/* 1. Welcome Section (Moved up, clean, minimal padding) */}
      <div style={{
        marginBottom: '22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Welcome back, <span className="text-gradient">{user?.name || 'Student'}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Keep learning, sharing and growing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-primary" style={{ padding: '5px 11px', fontSize: '0.78rem' }}>
            <Sparkles size={13} /> 7-Day Trial: {trialDays}d left
          </span>
          <Link to="/swaps" className="btn btn-primary btn-sm">
            <ArrowLeftRight size={14} /> Request Swap
          </Link>
          <Link to="/doubts" className="btn btn-secondary btn-sm">
            <HelpCircle size={14} /> Ask Doubt
          </Link>
        </div>
      </div>

      {/* 2. Compact Key Stats Bar (Reduced Tokens / Credits Display) */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {/* Credit Balance */}
        <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Coins size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Credit Balance</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fcd34d' }}>{user?.credits || 50}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>credits</span>
            </div>
          </div>
        </div>

        {/* Peer Rating */}
        <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(245, 158, 11, 0.12)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Star size={18} fill="#f59e0b" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Peer Rating</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.rating || 5.0}★</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>({user?.totalRatings || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(244, 63, 94, 0.12)',
            color: '#f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Flame size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Learning Streak</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb7185' }}>{user?.currentStreak || 1}d</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>active</span>
            </div>
          </div>
        </div>

        {/* Skills In Profile */}
        <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.12)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ArrowLeftRight size={18} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Skills in Profile</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a5b4fc' }}>
                {(user?.skillsToTeach?.length || 0) + (user?.skillsToLearn?.length || 0)}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {user?.skillsToTeach?.length || 0} teach • {user?.skillsToLearn?.length || 0} learn
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '22px' }}>
        {/* Left Column: Learning Progress Graph with 3 Horizontal Tabs & Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Learning Progress Graph Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} color="#6366f1" />
                <h3 style={{ fontSize: '1.08rem', fontWeight: 700 }}>Learning Progress</h3>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>Past 6 Months</span>
            </div>

            {/* Recharts Render Area */}
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {graphTab === 'progress' ? (
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTaught" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#121929', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '6px' }} />
                    <Area type="monotone" dataKey="skillsLearned" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSkills)" name="Skills Learned" />
                    <Area type="monotone" dataKey="skillsTaught" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTaught)" name="Skills Taught" />
                  </AreaChart>
                ) : graphTab === 'activity' ? (
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#121929', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '6px' }} />
                    <Area type="monotone" dataKey="creditsEarned" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCredits)" name="Credits Earned" />
                  </AreaChart>
                ) : (
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#121929', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '0.8rem' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Skill Focus %" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Clean Horizontal 3-Option Navigation Immediately Below the Graph */}
            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Graph View:</span>
              <div className="segmented-control" style={{ overflowX: 'auto' }}>
                <button
                  type="button"
                  onClick={() => setGraphTab('progress')}
                  className={`segmented-control-btn ${graphTab === 'progress' ? 'active' : ''}`}
                >
                  📈 Progress
                </button>
                <button
                  type="button"
                  onClick={() => setGraphTab('activity')}
                  className={`segmented-control-btn ${graphTab === 'activity' ? 'active' : ''}`}
                >
                  ⚡ Activity
                </button>
                <button
                  type="button"
                  onClick={() => setGraphTab('goals')}
                  className={`segmented-control-btn ${graphTab === 'goals' ? 'active' : ''}`}
                >
                  🎯 Goals
                </button>
              </div>
            </div>
          </div>

          {/* Recommended Skill Partners */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700 }}>Recommended Skill Partners</h3>
              <Link to="/matches" style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                View All →
              </Link>
            </div>

            {recommendedStudents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recommendedStudents.map((match, idx) => (
                  <div key={idx} style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={match.student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${match.student.name}`}
                        alt={match.student.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{match.student.name}</span>
                          <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                            {match.matchScore}% Match
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Teaches: <strong>{match.student.skillsToTeach?.join(', ') || 'Various'}</strong>
                        </p>
                      </div>
                    </div>
                    <Link to="/swaps" className="btn btn-primary btn-sm" style={{ padding: '5px 11px', fontSize: '0.8rem' }}>
                      Swap <ArrowLeftRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 16px' }}>
                <p style={{ fontSize: '0.85rem' }}>Add skills in your profile to receive smart partner recommendations!</p>
                <Link to="/settings" className="btn btn-primary btn-sm" style={{ marginTop: '10px' }}>
                  Update Skills
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Unified Productivity Widget & Milestone Video Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Productivity Suite with Horizontal Tabs */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 700 }}>Academic Planner</h3>
              <Link to="/planner" style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600 }}>
                Open Planner →
              </Link>
            </div>

            {/* Horizontal 3-Tab Segmented Control for Productivity */}
            <div className="segmented-control" style={{ width: '100%', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setProductivityTab('timetable')}
                className={`segmented-control-btn ${productivityTab === 'timetable' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center' }}
              >
                <CalendarDays size={13} style={{ display: 'inline', marginRight: '5px' }} />
                Classes
              </button>
              <button
                type="button"
                onClick={() => setProductivityTab('deadlines')}
                className={`segmented-control-btn ${productivityTab === 'deadlines' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center' }}
              >
                <Clock size={13} style={{ display: 'inline', marginRight: '5px' }} />
                Deadlines
              </button>
              <button
                type="button"
                onClick={() => setProductivityTab('todos')}
                className={`segmented-control-btn ${productivityTab === 'todos' ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center' }}
              >
                <CheckSquare size={13} style={{ display: 'inline', marginRight: '5px' }} />
                Todos
              </button>
            </div>

            {/* Tab 1: Timetable */}
            {productivityTab === 'timetable' && (
              <div>
                {plannerSummary?.todayClasses && plannerSummary.todayClasses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plannerSummary.todayClasses.map((c, i) => (
                      <div key={i} style={{
                        padding: '9px 12px',
                        borderLeft: `3px solid ${c.color || '#6366f1'}`,
                        background: 'var(--bg-surface)',
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
                      }}>
                        <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.subject}</p>
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {c.startTime} - {c.endTime} • {c.room}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                    No classes scheduled today. Great time for a skill swap!
                  </p>
                )}
              </div>
            )}

            {/* Tab 2: Deadlines */}
            {productivityTab === 'deadlines' && (
              <div>
                {plannerSummary?.deadlines && plannerSummary.deadlines.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plannerSummary.deadlines.map((d, i) => (
                      <div key={i} style={{
                        padding: '9px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{d.title}</p>
                          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{d.subject}</p>
                        </div>
                        <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                          {new Date(d.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                    No impending deadlines. You're completely on track!
                  </p>
                )}
              </div>
            )}

            {/* Tab 3: Todos */}
            {productivityTab === 'todos' && (
              <div>
                {plannerSummary?.todos && plannerSummary.todos.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {plannerSummary.todos.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => handleToggleTodo(t._id, t.completed)}
                        style={{
                          padding: '7px 10px',
                          background: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '9px',
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
                          fontSize: '0.84rem',
                          textDecoration: t.completed ? 'line-through' : 'none',
                          color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                        }}>
                          {t.title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                    No active todos. Add your study goals in Planner.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Milestone Video Educational Progress (Compact) */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlayCircle size={17} color="#10b981" />
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>5-Video Milestone</h4>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>+50 Credits</span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Watch 5 bite-sized skill videos to claim a 50 credits bonus!
            </p>

            <div style={{ width: '100%', height: '7px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, ((videoStats?.totalWatched || 0) / 5) * 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              <span>{videoStats?.totalWatched || 0}/5 watched</span>
              <Link to="/videos" style={{ color: '#10b981', fontWeight: 600 }}>Watch Now →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
