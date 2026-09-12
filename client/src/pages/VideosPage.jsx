import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.jsx';
import { 
  Video as VideoIcon, 
  Play, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Coins, 
  Award, 
  ExternalLink 
} from 'lucide-react';

export const VideosPage = () => {
  const { user, refreshUser } = useAuth();
  const [videoData, setVideoData] = useState({ videos: [], totalWatched: 0, rewardClaimed: false });
  const [loading, setLoading] = useState(true);

  // Player modal
  const [activeVideo, setActiveVideo] = useState(null);
  const [watching, setWatching] = useState(false);
  const [milestoneCelebration, setMilestoneCelebration] = useState(null);

  const fetchVideos = async () => {
    try {
      const data = await api.get('/videos');
      setVideoData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleWatchVideo = async (video) => {
    setActiveVideo(video);
  };

  const handleCompleteWatch = async (videoId) => {
    setWatching(true);
    try {
      const res = await api.post(`/videos/${videoId}/watch`, {});
      if (res.rewardAwarded) {
        setMilestoneCelebration(res.message);
      }
      await fetchVideos();
      await refreshUser();
      setActiveVideo(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setWatching(false);
    }
  };

  const totalWatched = videoData.totalWatched || 0;
  const progressPercent = Math.min(100, (totalWatched / 5) * 100);

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
          <VideoIcon size={14} /> Curated Video Masterclasses
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Learning <span className="text-gradient">Video Hub</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '650px' }}>
          Bite-sized, high-yield educational videos created to upgrade your technical concepts and career readiness.
        </p>
      </div>

      {/* Feature 9 Milestone Reward Card */}
      <div className="glass-card" style={{
        padding: '24px',
        marginBottom: '36px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(18, 25, 41, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>5-Video Educational Milestone</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Watch 5 eligible masterclasses to unlock a verified <strong style={{ color: '#fcd34d' }}>+50 Credits Reward</strong>!
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {videoData.rewardClaimed ? (
              <span className="badge badge-emerald" style={{ padding: '6px 14px', fontSize: '0.9rem' }}>
                <CheckCircle size={16} /> Milestone Completed (+50 Credits Claimed)
              </span>
            ) : (
              <span className="badge badge-amber" style={{ padding: '6px 14px', fontSize: '0.9rem' }}>
                <Coins size={16} /> Reward: 50 Credits
              </span>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div style={{ width: '100%', height: '12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>{totalWatched} of 5 Videos Watched ({progressPercent}%)</span>
          <span>{totalWatched >= 5 ? 'Milestone Reached!' : `${5 - totalWatched} more needed`}</span>
        </div>
      </div>

      {/* Milestone Success Modal */}
      {milestoneCelebration && (
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          color: 'white',
          fontWeight: 700,
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={24} />
            <span>{milestoneCelebration}</span>
          </div>
          <button onClick={() => setMilestoneCelebration(null)} className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Video Cards Grid */}
      <div className="grid-3">
        {videoData.videos.map((vid) => (
          <div key={vid._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Thumbnail */}
            <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
              <img
                src={vid.thumbnail}
                alt={vid.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                background: 'rgba(0, 0, 0, 0.8)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Clock size={12} /> {vid.duration}
              </div>

              {vid.isWatched && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  background: 'rgba(16, 185, 129, 0.9)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle size={13} /> Watched
                </div>
              )}
            </div>

            {/* Video Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span className="badge badge-primary" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>
                {vid.category}
              </span>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: 1.35 }}>{vid.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', flex: 1 }}>
                {vid.description}
              </p>

              <button
                onClick={() => handleWatchVideo(vid)}
                className={`btn ${vid.isWatched ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%', padding: '10px' }}
              >
                <Play size={16} /> {vid.isWatched ? 'Watch Again' : 'Watch & Earn Progress'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Video Player Modal */}
      <Modal
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        title={activeVideo?.title || 'Video Player'}
        maxWidth="720px"
      >
        <div>
          {/* Embedded responsive YouTube/educational frame */}
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', marginBottom: '16px', background: '#000' }}>
            <iframe
              src={activeVideo?.videoUrl}
              title={activeVideo?.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category: {activeVideo?.category} • Duration: {activeVideo?.duration}</p>
            </div>

            <button
              onClick={() => handleCompleteWatch(activeVideo._id)}
              disabled={watching}
              className="btn btn-emerald"
            >
              <CheckCircle size={16} /> {watching ? 'Saving Progress...' : 'Mark Watched & Count Progress'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
