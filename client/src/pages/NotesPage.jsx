import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.jsx';
import { NotebookPen, Plus, Search, Edit3, Trash2, Zap, Send } from 'lucide-react';

export const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Short Note state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [savingQuick, setSavingQuick] = useState(false);

  // Modal Note state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [tags, setTags] = useState('');
  const [color, setColor] = useState('#6366f1');

  const fetchNotes = async () => {
    try {
      const data = await api.get(`/notes?search=${encodeURIComponent(search)}`);
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search]);

  const handleCreateQuickNote = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickContent.trim()) return;

    setSavingQuick(true);
    try {
      await api.post('/notes', {
        title: quickTitle.trim(),
        content: quickContent.trim(),
        category: 'Quick Notes',
        color: '#10b981'
      });
      setQuickTitle('');
      setQuickContent('');
      await fetchNotes();
    } catch (err) {
      alert(err.message || 'Failed to save quick note');
    } finally {
      setSavingQuick(false);
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('Computer Science');
    setTags('');
    setColor('#6366f1');
    setModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setTags(note.tags?.join(', ') || '');
    setColor(note.color || '#6366f1');
    setModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote._id}`, { title, content, category, tags, color });
      } else {
        await api.post('/notes', { title, content, category, tags, color });
      }
      setModalOpen(false);
      fetchNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '8px' }}>
            <NotebookPen size={14} /> Personal Knowledge Repository
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Study <span className="text-gradient">Notes</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
            Capture quick ideas, revision notes, formula sheets, and peer swap takeaways.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-secondary btn-sm">
          <Plus size={16} /> Detailed Note
        </button>
      </div>

      {/* Lightweight Quick Note / Short Note Composer */}
      <div className="glass-card" style={{
        padding: '16px 20px',
        marginBottom: '24px',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        background: 'rgba(30, 41, 59, 0.45)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Zap size={15} color="#6366f1" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Quick Note
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            — jot down a fast thought without opening an editor
          </span>
        </div>

        <form onSubmit={handleCreateQuickNote} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Short note title..."
              className="form-input"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              style={{ flex: '1 1 200px', fontSize: '0.88rem', padding: '8px 12px' }}
              required
            />
            <input
              type="text"
              placeholder="Write short content or bullet points..."
              className="form-input"
              value={quickContent}
              onChange={(e) => setQuickContent(e.target.value)}
              style={{ flex: '2 1 320px', fontSize: '0.88rem', padding: '8px 12px' }}
              required
            />
            <button
              type="submit"
              disabled={savingQuick || !quickTitle.trim() || !quickContent.trim()}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              <Send size={14} /> {savingQuick ? 'Saving...' : 'Save Quick Note'}
            </button>
          </div>
        </form>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '12px 16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search notes by title, keywords, or tags..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', fontSize: '0.88rem', height: '40px' }}
          />
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        </div>
      </div>

      {/* Notes Grid */}
      {notes.length > 0 ? (
        <div className="grid-3">
          {notes.map((note) => (
            <div key={note._id} className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', borderTop: `4px solid ${note.color || '#6366f1'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="badge badge-primary">{note.category}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEditModal(note)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => handleDeleteNote(note._id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{note.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '16px', flex: 1, whiteSpace: 'pre-line' }}>
                {note.content}
              </p>

              {note.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {note.tags.map((t, i) => (
                    <span key={i} style={{ fontSize: '0.75rem', color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Updated {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-card">
          <NotebookPen className="empty-state-icon" />
          <p>No study notes found yet. Jot down a quick note above or click "+ Detailed Note".</p>
        </div>
      )}

      {/* Note Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingNote ? 'Edit Study Note' : 'Create Study Note'}
      >
        <form onSubmit={handleSaveNote}>
          <div className="form-group">
            <label className="form-label">Note Title</label>
            <input
              type="text"
              required
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Graph Traversal: BFS vs DFS Cheatsheet"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Computer Science, Mathematics, UI Design"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              required
              rows={6}
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your study notes, key formulas, or code snippets..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              className="form-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. exams, revision, algorithms"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
            {editingNote ? 'Save Changes' : 'Create Note'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
