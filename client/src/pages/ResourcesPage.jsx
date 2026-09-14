import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Modal } from '../components/Modal.jsx';
import { BookMarked, ThumbsUp, Plus, ExternalLink, User, Trash2 } from 'lucide-react';

export const ResourcesPage = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');

  // Form State
  const [newResource, setNewResource] = useState({
    title: '',
    author: '',
    resourceType: 'Book',
    description: '',
    link: ''
  });

  const fetchResources = async () => {
    try {
      const data = await api.get('/resources');
      setResources(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resources', newResource);
      setModalOpen(false);
      setNewResource({ title: '', author: '', resourceType: 'Book', description: '', link: '' });
      fetchResources();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleUpvote = async (id) => {
    try {
      const updatedResource = await api.put(`/resources/${id}/upvote`);
      setResources(prev => prev.map(r => r._id === id ? updatedResource : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredResources = filterType === 'All' 
    ? resources 
    : resources.filter(r => r.resourceType === filterType);

  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <BookMarked size={15} /> Student Resource Sharing
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Library & <span className="text-gradient">Referrals</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Discover and share books, tutorials, and articles with your peers.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Recommend Resource
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {['All', 'Book', 'Video', 'Link', 'Other'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className="btn btn-sm"
            style={{
              background: filterType === type ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-surface)',
              color: filterType === type ? '#a5b4fc' : 'var(--text-secondary)',
              border: `1px solid ${filterType === type ? '#6366f1' : 'var(--border-color)'}`
            }}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Resource Grid */}
      {loading ? (
        <p>Loading resources...</p>
      ) : filteredResources.length > 0 ? (
        <div className="grid-3" style={{ gap: '20px' }}>
          {filteredResources.map(resource => {
            const hasUpvoted = resource.upvotes.includes(user?._id);
            return (
              <div key={resource._id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                    {resource.resourceType}
                  </span>
                  {resource.recommendedBy?._id === user?._id && (
                    <button onClick={() => handleDeleteResource(resource._id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>{resource.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '12px' }}>by {resource.author}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '16px' }}>
                  {resource.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {resource.recommendedBy?.avatar ? (
                      <img src={resource.recommendedBy.avatar} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                    ) : (
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={14} color="#fff" />
                      </div>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{resource.recommendedBy?.name?.split(' ')[0]}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleToggleUpvote(resource._id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', 
                        color: hasUpvoted ? '#3b82f6' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
                      }}
                    >
                      <ThumbsUp size={16} fill={hasUpvoted ? "#3b82f6" : "none"} /> {resource.upvotes.length}
                    </button>
                    {resource.link && (
                      <a href={resource.link.startsWith('http') ? resource.link : `https://\${resource.link}`} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No resources found. Be the first to share one!</p>
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Recommend a Resource">
        <form onSubmit={handleAddResource}>
          <div className="form-group">
            <label className="form-label">Resource Type</label>
            <select
              className="form-select"
              value={newResource.resourceType}
              onChange={(e) => setNewResource({ ...newResource, resourceType: e.target.value })}
            >
              <option value="Book">Book</option>
              <option value="Video">Video Course / Tutorial</option>
              <option value="Link">Article / Website</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Clean Code"
              value={newResource.title}
              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Author / Creator</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Robert C. Martin"
              value={newResource.author}
              onChange={(e) => setNewResource({ ...newResource, author: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">External Link (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="https://..."
              value={newResource.link}
              onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Why do you recommend this?</label>
            <textarea
              required
              rows={3}
              className="form-textarea"
              placeholder="It really helped me understand..."
              value={newResource.description}
              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            Share Resource
          </button>
        </form>
      </Modal>
    </div>
  );
};
