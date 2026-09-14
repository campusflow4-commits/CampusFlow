import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { 
  Coins, Flame, ArrowLeftRight, CalendarDays, PlayCircle, HelpCircle,
  TrendingUp, ChevronUp, ChevronDown, BookOpen, ClipboardList, Edit3,
  Clock, History, ArrowRight, Video, FileText, LayoutDashboard, Target
} from 'lucide-react';
import heroBg from '../assets/hero_student_night.jpg';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [plannerSummary, setPlannerSummary] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [videoStats, setVideoStats] = useState(null);
  const [recommendedStudents, setRecommendedStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [_loading, setLoading] = useState(true);

  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('campusflow_dash_collapsed');
    return saved ? JSON.parse(saved) : { graph: false, widgets: false, activity: false };
  });

  const toggleCollapse = (section) => {
    setCollapsed(prev => {
      const newState = { ...prev, [section]: !prev[section] };
      localStorage.setItem('campusflow_dash_collapsed', JSON.stringify(newState));
      return newState;
    });
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [plannerRes, statsRes, videoRes, matchesRes, historyRes] = await Promise.all([
          api.get('/planner/summary').catch(() => null),
          api.get('/stats/progress').catch(() => null),
          api.get('/videos').catch(() => null),
          api.get('/swaps/matches').catch(() => ({ matches: [] })),
          api.get('/credits/history').catch(() => ({ transactions: [] }))
        ]);

        setPlannerSummary(plannerRes);
        setProgressStats(statsRes);
        setVideoStats(videoRes);
        setRecommendedStudents(matchesRes.matches ? matchesRes.matches.slice(0, 3) : []);
        setRecentActivity(historyRes.transactions ? historyRes.transactions : []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const monthlyData = progressStats?.monthlySkillGrowth || [
    { month: 'Apr', skillsLearned: 1, skillsTaught: 0, creditsEarned: 30 },
    { month: 'May', skillsLearned: 2, skillsTaught: 1, creditsEarned: 50 },
    { month: 'Jun', skillsLearned: 3, skillsTaught: 2, creditsEarned: 70 },
    { month: 'Jul', skillsLearned: 4, skillsTaught: 2, creditsEarned: 85 },
    { month: 'Aug', skillsLearned: 5, skillsTaught: 3, creditsEarned: 110 },
    { month: 'Sep', skillsLearned: 6, skillsTaught: 4, creditsEarned: 140 }
  ];

  return (
    <div className="container" style={{ padding: '16px 20px', maxWidth: '1440px', margin: '0 auto' }}>
      
      
      {/* 1. Cinematic Hero Section */}
      <div style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)',
        background: '#020617',
        display: 'flex',
        flexDirection: 'row',
        minHeight: '320px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Background Image / Gradient */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6,
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(to right, rgba(2,6,23,0.95) 0%, rgba(2,6,23,0.7) 40%, rgba(2,6,23,0.2) 100%)',
          zIndex: 1
        }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flex: 1, padding: '40px' }}>
          {/* Left Text */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1rem', color: '#818cf8', fontWeight: 600, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Good to see you again! <span style={{ fontSize: '1.2rem' }}>👋</span>
            </p>
            <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 12px 0', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Welcome back,<br/>
              <span style={{ color: '#818cf8' }}>{user?.name || 'Student'}</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.05rem', margin: '0 0 24px 0', maxWidth: '400px' }}>
              Keep learning, sharing and growing. The next level of your academic journey starts here.
            </p>
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', padding: '12px 20px', borderRadius: '12px', display: 'inline-block', alignSelf: 'flex-start' }}>
              <p style={{ margin: 0, color: '#c7d2fe', fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                "Discipline today creates the success of tomorrow."
              </p>
            </div>
          </div>
          
          {/* Right Floating Text */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-end', paddingRight: '20px' }}>
             <h2 style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 0.9, textAlign: 'right', color: 'rgba(255,255,255,0.8)', margin: 0, textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
               Small<br/>Steps<br/><span style={{ color: '#38bdf8' }}>Big<br/>Results</span>
             </h2>
          </div>
        </div>
      </div>

      {/* 2. Quick Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Link to="/videos" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', textDecoration: 'none', color: 'inherit', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.1)', borderRadius: '16px', transition: 'all 0.2s' }}>
          <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))', borderRadius: '14px', color: '#818cf8', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <PlayCircle size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Continue Learning</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Watch videos where you left</p>
          </div>
          <ArrowRight size={18} color="#64748b" />
        </Link>
        
        <Link to="/quizzes" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', textDecoration: 'none', color: 'inherit', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(245, 158, 11, 0.1)', borderRadius: '16px', transition: 'all 0.2s' }}>
          <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))', borderRadius: '14px', color: '#fbbf24', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <ClipboardList size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Take a Quiz</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Test your knowledge</p>
          </div>
          <ArrowRight size={18} color="#64748b" />
        </Link>

        <Link to="/notes" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', textDecoration: 'none', color: 'inherit', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '16px', transition: 'all 0.2s' }}>
          <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))', borderRadius: '14px', color: '#34d399', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <Edit3 size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Create a Note</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Capture your ideas</p>
          </div>
          <ArrowRight size={18} color="#64748b" />
        </Link>

        <Link to="/planner" className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', textDecoration: 'none', color: 'inherit', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(236, 72, 153, 0.1)', borderRadius: '16px', transition: 'all 0.2s' }}>
          <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(236,72,153,0.05))', borderRadius: '14px', color: '#f472b6', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}>
            <CalendarDays size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>Open Planner</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Manage your schedule</p>
          </div>
          <ArrowRight size={18} color="#64748b" />
        </Link>
      </div>

      {/* 2. Main Analytics - 70/30 Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        
        {/* Left: Learning Progress Graph (70%) */}
        <div className="glass-card" style={{ padding: '16px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#6366f1" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Learning Progress</h3>
            </div>
            <button onClick={() => toggleCollapse('graph')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              {collapsed.graph ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>

          {!collapsed.graph && (
            <div style={{ width: '100%', height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTaught" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#0a0e19', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px', fontSize: '0.8rem' }} />
                  <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} iconType="circle" />
                  <Area type="monotone" dataKey="skillsLearned" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSkills)" name="Skills Learned" />
                  <Area type="monotone" dataKey="skillsTaught" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTaught)" name="Skills Taught" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: This Month Stats (30%) */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target size={18} color="#10b981" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>This Month</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Video size={16} color="#3b82f6" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Videos Watched</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{videoStats?.totalWatched || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ClipboardList size={16} color="#f59e0b" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Quizzes Done</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{progressStats?.categoryDistribution?.[0]?.value || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Edit3 size={16} color="#10b981" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notes Created</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{progressStats?.monthlySkillGrowth?.[5]?.skillsLearned || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ArrowLeftRight size={16} color="#8b5cf6" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Skills Taught</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{user?.skillsToTeach?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Widgets Row (Compact) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        
        {/* Widget: Academic Planner Preview */}
        <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <CalendarDays size={15} color="#6366f1" />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Academic Planner</h4>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '90px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {plannerSummary?.todayClasses && plannerSummary.todayClasses.length > 0 ? (
              plannerSummary.todayClasses.slice(0, 2).map((c, i) => (
                <div key={i} style={{ padding: '6px 10px', borderLeft: `2px solid ${c.color || '#6366f1'}`, background: 'rgba(255,255,255,0.02)', borderRadius: '0 4px 4px 0' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.75rem', margin: 0 }}>{c.subject}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>{c.startTime} - {c.endTime}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No classes today.</p>
            )}
          </div>
        </div>

        {/* Widget: 5 Videos Milestone */}
        <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <PlayCircle size={15} color="#10b981" />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Video Milestone</h4>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Watch 5 videos (+20 Credits)</p>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, ((videoStats?.totalWatched || 0) / 5) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>{videoStats?.totalWatched || 0}/5 watched</span>
            </div>
          </div>
        </div>

        {/* Widget: Milestones */}
        <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Target size={15} color="#f59e0b" />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Milestones</h4>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Current Streak: {user?.currentStreak || 1} Days</p>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, ((user?.currentStreak || 1) / 7) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Credits: {user?.credits || 0}</p>
          </div>
        </div>

        {/* Widget: Recommended Partners */}
        <div className="glass-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <ArrowLeftRight size={15} color="#8b5cf6" />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recommended Skills</h4>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '90px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recommendedStudents.length > 0 ? (
              recommendedStudents.map((match, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '6px 8px', borderRadius: '6px' }}>
                  <img src={match.student.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${match.student.name}`} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{match.student.name}</p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{match.matchScore}% Match</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No matches found.</p>
            )}
          </div>
        </div>
      </div>

      {/* 4. Upcoming Schedule + Recent Activity + Quote */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>

      {/* Motivational Quote Card */}
      <div style={{
        position: 'relative',
        padding: '24px',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: '1px solid rgba(99,102,241,0.2)'
      }}>
        {/* Subtle mountain/night silhouette glow */}
        <div style={{
          position: 'absolute',
          bottom: '-20%', right: '-10%',
          width: '150%', height: '100%',
          background: 'radial-gradient(ellipse at bottom right, rgba(139,92,246,0.2), transparent 70%)',
          zIndex: 0
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e0e7ff', lineHeight: 1.4, margin: '0 0 16px 0', fontFamily: 'var(--font-heading)' }}>
            "Discipline today<br/>creates the success<br/>of tomorrow."
          </p>
          <div style={{ width: '40px', height: '4px', background: '#818cf8', borderRadius: '4px' }} />
        </div>
      </div>

        
        {/* Upcoming Schedule */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarDays size={18} color="#6366f1" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Upcoming Schedule</h3>
            </div>
            <Link to="/planner" style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {plannerSummary?.todayClasses && plannerSummary.todayClasses.length > 0 ? (
              plannerSummary.todayClasses.slice(0, 3).map((c, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '12px 14px', background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' 
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{c.subject}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>{c.type || 'Class'}</p>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {c.startTime} - {c.endTime}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <p>No upcoming events.</p>
              </div>
            )}
          </div>
        </div>

      {/* Recent Activity */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="#f43f5e" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Recent Activity</h3>
          </div>
          <button onClick={() => toggleCollapse('activity')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            {collapsed.activity ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>

        {!collapsed.activity && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentActivity.length > 0 ? (
              recentActivity.map((tx, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  padding: '12px 14px', background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px' 
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{tx.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>{tx.type}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: tx.amount > 0 ? '#10b981' : '#f43f5e' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <p>No recent activity. Start learning or taking quizzes to earn credits!</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontFamily: 'var(--font-heading)' }}>CampusFlow</h2>
        <p style={{ fontSize: '0.8rem', marginBottom: '12px' }}>Learn &bull; Collaborate &bull; Grow &bull; Succeed</p>
        <p style={{ fontSize: '0.7rem' }}>Created by &hearts;<br/>Akshra &bull; Vanshika &bull; Parth &bull; Kashif</p>
      </div>

    </div>
  );
};
