import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Repeat, 
  Sparkles, 
  Coins, 
  BrainCircuit, 
  Users, 
  ShieldCheck, 
  Video, 
  Calendar, 
  ArrowRight, 
  Star, 
  CheckCircle2 
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '90px 0 70px 0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow background circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.05) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="badge badge-primary" style={{ marginBottom: '20px', padding: '6px 16px', fontSize: '0.85rem' }}>
            <Sparkles size={16} /> The #1 Student Skill-Exchange Network
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
            fontWeight: 800,
            maxWidth: '900px',
            margin: '0 auto 20px auto',
            letterSpacing: '-0.02em'
          }}>
            Learn. Teach. <span className="text-gradient">Swap Skills.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
            color: 'var(--text-secondary)',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
            lineHeight: 1.6
          }}>
            Why pay for expensive courses when students on your campus already know what you need? Teach a skill, learn a skill, and grow together without spending a single rupee.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              Student Login
            </Link>
          </div>

          {/* Quick value props pill list */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '40px',
            flexWrap: 'wrap',
            color: 'var(--text-muted)',
            fontSize: '0.9rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10b981" /> 50 Free Starter Credits
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10b981" /> 7-Day Free Trial
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#10b981" /> Verified Gmail Only
            </span>
          </div>
        </div>
      </section>

      {/* How SkillSwap Works */}
      <section id="how-it-works" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>How SkillSwap Works</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto' }}>
              Simple 3-step peer exchange powered by our smart matching engine and credit system.
            </p>
          </div>

          <div className="grid-3">
            <div className="glass-card" style={{ padding: '32px 24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>1</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>List Your Skills</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Add the skills you are good at (like Python, Guitar, or Figma) and list the skills you are eager to master.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '32px 24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#c084fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>2</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Get Smart Matches</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Our intelligent algorithm pairs you with students whose teaching directly aligns with your learning goals.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '32px 24px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#6ee7b7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>3</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Swap & Earn Credits</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Connect via live chat or video. Complete your session to earn ratings and recharge credits for future swaps!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why SkillSwap / Feature Grid */}
      <section id="features" style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Built For Modern Students</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to boost your academic grades, technical portfolios, and campus connections.
            </p>
          </div>

          <div className="grid-3">
            <div className="glass-card" style={{ padding: '28px' }}>
              <Coins size={28} color="#f59e0b" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Fair Credit Economy</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Earn credits by teaching, answering doubts, passing quizzes, and watching skill videos. Spend credits to learn.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <BrainCircuit size={28} color="#6366f1" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Smart Match Percentage</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                See exact compatibility ratings (e.g. 94% match) with transparent reasons why two students should collaborate.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <Video size={28} color="#10b981" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Video Milestone Rewards</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Watch curated 10-minute masterclasses. Complete 5 videos to trigger an instant 50-credit milestone bonus!
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <Calendar size={28} color="#8b5cf6" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Academic Planner</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Keep track of your weekly class timetable, impending assignment deadlines, lab practicals, and todo lists.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <Users size={28} color="#06b6d4" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Real-time Peer Chat</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Instantly message other learners with Socket.IO real-time delivery, online status indicators, and alerts.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <ShieldCheck size={28} color="#f43f5e" style={{ marginBottom: '14px' }} />
              <h4 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>Single-Device Protection</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Protected student accounts linked to one active device session with community dispute reporting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '12px' }}>Loved by Engineering Students</h2>
            <p style={{ color: 'var(--text-secondary)' }}>See how students are learning and teaching every day.</p>
          </div>

          <div className="grid-3">
            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                "I needed help with React props and state. A 3rd year student swapped React lessons for my Figma UI tutorials. It was 10x better than YouTube tutorials!"
              </p>
              <div>
                <p style={{ fontWeight: 700 }}>Priya Patel</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2nd Year IT Student</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                "Teaching Python to juniors refreshed my own data structures concepts for placements. Plus, earning credits to get interview advice was a game changer."
              </p>
              <div>
                <p style={{ fontWeight: 700 }}>Aarav Sharma</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>3rd Year CS Student</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#f59e0b', marginBottom: '12px' }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.95rem' }}>
                "The 5-video reward gave me an extra 50 credits on my first day. The timetable planner and deadline countdowns keep me organized before exams."
              </p>
              <div>
                <p style={{ fontWeight: 700 }}>Sneha Iyer</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1st Year Mathematics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(11, 15, 25, 0) 100%)'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>
            Ready to Swap Your First Skill?
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 30px auto' }}>
            Join your student community today. Register with your Gmail and get 50 starter credits instantly.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};
