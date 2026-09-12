import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Modal } from '../components/Modal.jsx';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Tag 
} from 'lucide-react';

export const PlannerPage = () => {
  const [tab, setTab] = useState('todos'); // 'todos' | 'deadlines' | 'practicals' | 'timetable'

  // Data states
  const [todos, setTodos] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [practicals, setPracticals] = useState([]);
  const [timetable, setTimetable] = useState([]);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);

  // Todo Form
  const [newTodo, setNewTodo] = useState({ title: '', priority: 'medium' });

  // Deadline Form
  const [newDeadline, setNewDeadline] = useState({ title: '', subject: '', dueDate: '', priority: 'high' });

  // Practical Form
  const [newPractical, setNewPractical] = useState({ subject: '', title: '', notes: '' });

  // Timetable Form
  const [newClass, setNewClass] = useState({
    day: 'Monday',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    subject: '',
    room: 'Lab 301',
    color: '#6366f1'
  });

  const loadData = async () => {
    try {
      const [tRes, dRes, pRes, ttRes] = await Promise.all([
        api.get('/planner/todos'),
        api.get('/planner/deadlines'),
        api.get('/planner/practicals'),
        api.get('/planner/timetable')
      ]);
      setTodos(tRes);
      setDeadlines(dRes);
      setPracticals(pRes);
      setTimetable(ttRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Todo Handlers
  const handleAddTodo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/planner/todos', newTodo);
      setNewTodo({ title: '', priority: 'medium' });
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleTodo = async (id, current) => {
    try {
      await api.put(`/planner/todos/${id}`, { completed: !current });
      setTodos(prev => prev.map(t => t._id === id ? { ...t, completed: !current } : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await api.delete(`/planner/todos/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Deadline Handlers
  const handleAddDeadline = async (e) => {
    e.preventDefault();
    try {
      await api.post('/planner/deadlines', newDeadline);
      setNewDeadline({ title: '', subject: '', dueDate: '', priority: 'high' });
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDeadline = async (id) => {
    try {
      await api.delete(`/planner/deadlines/${id}`);
      setDeadlines(prev => prev.filter(d => d._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Practical Handlers
  const handleAddPractical = async (e) => {
    e.preventDefault();
    try {
      await api.post('/planner/practicals', newPractical);
      setNewPractical({ subject: '', title: '', notes: '' });
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdatePracticalStatus = async (id, status) => {
    try {
      await api.put(`/planner/practicals/${id}`, { status });
      setPracticals(prev => prev.map(p => p._id === id ? { ...p, status } : p));
    } catch (err) {
      console.error(err);
    }
  };

  // Timetable Handlers
  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await api.post('/planner/timetable', newClass);
      setNewClass({
        day: 'Monday',
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        subject: '',
        room: 'Lab 301',
        color: '#6366f1'
      });
      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteClass = async (id) => {
    try {
      await api.delete(`/planner/timetable/${id}`);
      setTimetable(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <Calendar size={15} /> Student Productivity Suite
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
            Academic <span className="text-gradient">Planner</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Stay ahead of your coursework, lab practicals, deadlines, and weekly schedules.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Add {tab === 'todos' ? 'Task' : tab === 'deadlines' ? 'Deadline' : tab === 'practicals' ? 'Practical' : 'Class'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        marginBottom: '28px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setTab('todos')}
          className="btn btn-sm"
          style={{
            background: tab === 'todos' ? 'rgba(99, 102, 241, 0.2)' : 'none',
            color: tab === 'todos' ? '#a5b4fc' : 'var(--text-secondary)'
          }}
        >
          <CheckSquare size={16} /> Todo List ({todos.filter(t => !t.completed).length})
        </button>
        <button
          onClick={() => setTab('deadlines')}
          className="btn btn-sm"
          style={{
            background: tab === 'deadlines' ? 'rgba(244, 63, 94, 0.2)' : 'none',
            color: tab === 'deadlines' ? '#fda4af' : 'var(--text-secondary)'
          }}
        >
          <Clock size={16} /> Deadlines ({deadlines.length})
        </button>
        <button
          onClick={() => setTab('practicals')}
          className="btn btn-sm"
          style={{
            background: tab === 'practicals' ? 'rgba(16, 185, 129, 0.2)' : 'none',
            color: tab === 'practicals' ? '#6ee7b7' : 'var(--text-secondary)'
          }}
        >
          <BookOpen size={16} /> Practicals ({practicals.length})
        </button>
        <button
          onClick={() => setTab('timetable')}
          className="btn btn-sm"
          style={{
            background: tab === 'timetable' ? 'rgba(139, 92, 246, 0.2)' : 'none',
            color: tab === 'timetable' ? '#c084fc' : 'var(--text-secondary)'
          }}
        >
          <Calendar size={16} /> Weekly Timetable ({timetable.length})
        </button>
      </div>

      {/* Tab Contents */}
      {tab === 'todos' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Your Action Items</h3>
          {todos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {todos.map((todo) => (
                <div key={todo._id} style={{
                  padding: '12px 16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleTodo(todo._id, todo.completed)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <span style={{
                      fontSize: '0.95rem',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}>
                      {todo.title}
                    </span>
                    <span className={`badge ${todo.priority === 'high' ? 'badge-rose' : todo.priority === 'medium' ? 'badge-amber' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                      {todo.priority}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteTodo(todo._id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No tasks added yet. Click "+ Add Task" above!</p>
          )}
        </div>
      )}

      {tab === 'deadlines' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Impending Academic Deadlines</h3>
          {deadlines.length > 0 ? (
            <div className="grid-2">
              {deadlines.map((dl) => {
                const due = new Date(dl.dueDate);
                const diffDays = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = diffDays <= 3;

                return (
                  <div key={dl._id} style={{
                    padding: '18px',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid ${isUrgent ? '#f43f5e' : '#f59e0b'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge badge-primary">{dl.subject}</span>
                        <h4 style={{ fontSize: '1.1rem', marginTop: '6px' }}>{dl.title}</h4>
                      </div>
                      <button onClick={() => handleDeleteDeadline(dl._id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Due: {due.toLocaleDateString()}</span>
                      <span className={`badge ${isUrgent ? 'badge-rose' : 'badge-amber'}`}>
                        {diffDays <= 0 ? 'Due Today' : `${diffDays} days left`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No upcoming deadlines tracked.</p>
          )}
        </div>
      )}

      {tab === 'practicals' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Lab Practicals & Submissions</h3>
          {practicals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {practicals.map((prac) => (
                <div key={prac._id} style={{
                  padding: '16px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <span className="badge badge-primary">{prac.subject}</span>
                    <h4 style={{ fontSize: '1.05rem', marginTop: '4px' }}>{prac.title}</h4>
                    {prac.notes && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{prac.notes}</p>}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                      className="form-select"
                      style={{ padding: '6px 10px', fontSize: '0.85rem', width: '130px' }}
                      value={prac.status}
                      onChange={(e) => handleUpdatePracticalStatus(prac._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)' }}>No lab practicals added.</p>
          )}
        </div>
      )}

      {tab === 'timetable' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Weekly Class Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {daysOfWeek.map((day) => {
              const dayClasses = timetable.filter(c => c.day === day);

              return (
                <div key={day} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <h4 style={{ fontSize: '1rem', color: '#a5b4fc', marginBottom: '10px' }}>{day}</h4>
                  {dayClasses.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {dayClasses.map((item) => (
                        <div key={item._id} style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg-surface)',
                          borderLeft: `4px solid ${item.color || '#6366f1'}`,
                          minWidth: '220px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.subject}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {item.startTime} - {item.endTime} • {item.room}
                            </p>
                          </div>
                          <button onClick={() => handleDeleteClass(item._id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginLeft: '10px' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No classes scheduled</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Creation Modal dynamically renders based on active tab */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={tab === 'todos' ? 'Add Todo Task' : tab === 'deadlines' ? 'Track New Deadline' : tab === 'practicals' ? 'Add Lab Practical' : 'Add Weekly Class'}
      >
        {tab === 'todos' && (
          <form onSubmit={handleAddTodo}>
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Finish Data Structures assignment"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={newTodo.priority}
                onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>Add Task</button>
          </form>
        )}

        {tab === 'deadlines' && (
          <form onSubmit={handleAddDeadline}>
            <div className="form-group">
              <label className="form-label">Deadline Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Operating Systems Final Project"
                value={newDeadline.title}
                onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. CS302"
                value={newDeadline.subject}
                onChange={(e) => setNewDeadline({ ...newDeadline, subject: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={newDeadline.dueDate}
                onChange={(e) => setNewDeadline({ ...newDeadline, dueDate: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>Track Deadline</button>
          </form>
        )}

        {tab === 'practicals' && (
          <form onSubmit={handleAddPractical}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Database Management Lab"
                value={newPractical.subject}
                onChange={(e) => setNewPractical({ ...newPractical, subject: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Practical Title / Experiment</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Experiment 4: B-Tree Indexing and Query Optimization"
                value={newPractical.title}
                onChange={(e) => setNewPractical({ ...newPractical, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                rows={2}
                className="form-textarea"
                placeholder="Submission checklist or viva preparation notes..."
                value={newPractical.notes}
                onChange={(e) => setNewPractical({ ...newPractical, notes: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>Add Practical</button>
          </form>
        )}

        {tab === 'timetable' && (
          <form onSubmit={handleAddClass}>
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select
                className="form-select"
                value={newClass.day}
                onChange={(e) => setNewClass({ ...newClass, day: e.target.value })}
              >
                {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="09:00 AM"
                  value={newClass.startTime}
                  onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="10:30 AM"
                  value={newClass.endTime}
                  onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subject / Course</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Artificial Intelligence"
                value={newClass.subject}
                onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Room / Lab Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Room 402 or Google Meet"
                value={newClass.room}
                onChange={(e) => setNewClass({ ...newClass, room: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>Save to Timetable</button>
          </form>
        )}
      </Modal>
    </div>
  );
};
