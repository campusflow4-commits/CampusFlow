import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.jsx';
import { BookOpen, Plus, Search, Edit3, Trash2, Tag } from 'lucide-react';

export const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

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
    <div className="container" style={{ padding: '36px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <BookOpen size={14} /> Personal Knowledge Repository
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Study <span className="text-gradient">Notes</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Capture revision notes, code templates, formula sheets, and peer swap takeaways.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> New Note
        </button>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '28px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search notes by title, keywords, or tags..."
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
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
          <BookOpen className="empty-state-icon" />
          <p>No study notes found. Click "+ New Note" to save your thoughts.</p>
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
