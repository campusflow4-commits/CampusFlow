import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getDeviceId } from '../services/api.js';
import { 
  User, 
  Lock, 
  Coins, 
  Sparkles, 
  Smartphone, 
  Save,
  Type,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  Camera,
  X,
  Upload
} from 'lucide-react';

const PREDEFINED_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=student1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=student2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=student3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=student4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=student5'
];

export const SettingsPage = () => {
  const { user, updateProfile, refreshUser } = useAuth();

  // Font customization state
  const [selectedFont, setSelectedFont] = useState('system');

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [year, setYear] = useState(user?.year || '2nd Year');
  const [college, setCollege] = useState(user?.college || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsToTeach, setSkillsToTeach] = useState((user?.skillsToTeach || []).join(', '));
  const [skillsToLearn, setSkillsToLearn] = useState((user?.skillsToLearn || []).join(', '));
  const [experience, setExperience] = useState(user?.experience || []);
  const [projects, setProjects] = useState(user?.projects || []);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Credits history
  const [creditLedger, setCreditLedger] = useState({ currentBalance: 50, transactions: [] });

  // Notifications
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Avatar Modal State
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarSelection, setAvatarSelection] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  useEffect(() => {
    setSelectedFont(user?.fontPreference || 'system');

    if (user) {
      setName(user.name);
      setYear(user.year);
      setCollege(user.college || '');
      setBio(user.bio || '');
      setSkillsToTeach((user.skillsToTeach || []).join(', '));
      setSkillsToLearn((user.skillsToLearn || []).join(', '));
      setExperience(user.experience || []);
      setProjects(user.projects || []);
    }

    const loadCredits = async () => {
      try {
        const data = await api.get('/credits/history');
        setCreditLedger(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCredits();
  }, [user]);

  const handleFontChange = async (fontKey) => {
    setSelectedFont(fontKey);
    try {
      await updateProfile({ fontPreference: fontKey });
      refreshUser();
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Failed to save font preference.' });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const teachArr = skillsToTeach.split(',').map(s => s.trim()).filter(Boolean);
      const learnArr = skillsToLearn.split(',').map(s => s.trim()).filter(Boolean);

      await updateProfile({
        name,
        year,
        college,
        bio,
        skillsToTeach: teachArr,
        skillsToLearn: learnArr,
        experience,
        projects
      });

      setProfileMsg({ type: 'success', text: 'Student profile updated successfully!' });
      refreshUser();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const deviceId = getDeviceId();
  const trialDays = user?.trialDaysRemaining ?? 7;

  // Handlers for CV Builder
  const handleAddExperience = () => setExperience([...experience, { title: '', company: '', duration: '', description: '' }]);
  const handleRemoveExperience = (index) => setExperience(experience.filter((_, i) => i !== index));
  const handleChangeExperience = (index, field, value) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  const handleAddProject = () => setProjects([...projects, { title: '', link: '', description: '' }]);
  const handleRemoveProject = (index) => setProjects(projects.filter((_, i) => i !== index));
  const handleChangeProject = (index, field, value) => {
    const newProj = [...projects];
    newProj[index][field] = value;
    setProjects(newProj);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Please select a valid JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image must be less than 2MB.');
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarSelection('custom');
  };

  const handleSaveAvatar = async () => {
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      if (avatarSelection === 'custom' && avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        await api.uploadAvatar(formData);
        await refreshUser();
      } else if (avatarSelection !== 'custom' && avatarSelection) {
        await updateProfile({ avatar: avatarSelection });
        await refreshUser();
      }
      setShowAvatarModal(false);
    } catch (err) {
      setAvatarError(err.message || 'Failed to update avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePrintCV = () => {
    const content = document.getElementById('printable-cv');
    if (!content) return;
    
    // Create a temporary iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>${name} - CV</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #111827; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
            h1 { font-size: 2.5rem; margin-bottom: 5px; color: #111827; font-weight: 800; }
            h2 { font-size: 1.4rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; margin-top: 30px; margin-bottom: 15px; color: #374151; font-weight: 700; }
            h3 { font-size: 1.1rem; margin: 0; color: #111827; font-weight: 600; }
            p { margin: 5px 0; font-size: 0.95rem; color: #4b5563; }
            .header-info { color: #6b7280; font-size: 1rem; margin-bottom: 25px; }
            .item-meta { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .meta-light { color: #6b7280; font-size: 0.9rem; }
            .badge { display: inline-block; background: #f3f4f6; padding: 4px 10px; border-radius: 4px; font-size: 0.85rem; margin-right: 8px; margin-bottom: 8px; color: #374151; border: 1px solid #e5e7eb; }
            .desc { font-size: 0.95rem; margin-bottom: 15px; }
            a { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    doc.close();
    
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 250);
  };

  return (
    <div className="container" style={{ padding: '32px 20px', maxWidth: '840px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Account <span className="text-gradient">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '2px' }}>
          Customize your appearance, student identity, password security, and active sessions.
        </p>
      </div>

      {/* Free Trial Banner */}
      <div className="glass-card" style={{
        padding: '18px 22px',
        marginBottom: '24px',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '4px' }}>
            <Sparkles size={13} /> Active Plan: Student Free Trial
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{trialDays} Days Remaining on 7-Day Free Trial</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Valid until {new Date(user?.trialEndDate || Date.now() + 7 * 86400000).toLocaleDateString()}
          </p>
        </div>
        <span className="badge badge-emerald" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
          ✓ All Platform Features Unlocked
        </span>
      </div>

      {/* Section 1: Appearance & Typography */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Type size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Appearance & Typography</h3>
          </div>
          <button
            type="button"
            onClick={() => handleFontChange('system')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.78rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={13} /> Reset to Default
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Choose your preferred reading font. Your selection applies immediately across all pages and is saved to your browser.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {/* System Default */}
          <button
            type="button"
            onClick={() => handleFontChange('system')}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${selectedFont === 'system' ? '#6366f1' : 'var(--border-color)'}`,
              background: selectedFont === 'system' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface)',
              color: selectedFont === 'system' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>System / Default</span>
              {selectedFont === 'system' && <Check size={16} color="#6366f1" />}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Clean platform native sans font
            </div>
          </button>

          {/* Inter */}
          <button
            type="button"
            onClick={() => handleFontChange('inter')}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${selectedFont === 'inter' ? '#6366f1' : 'var(--border-color)'}`,
              background: selectedFont === 'inter' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface)',
              color: selectedFont === 'inter' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Inter</span>
              {selectedFont === 'inter' && <Check size={16} color="#6366f1" />}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Modern, high-legibility UI sans
            </div>
          </button>

          {/* Poppins */}
          <button
            type="button"
            onClick={() => handleFontChange('poppins')}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${selectedFont === 'poppins' ? '#6366f1' : 'var(--border-color)'}`,
              background: selectedFont === 'poppins' ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-surface)',
              color: selectedFont === 'poppins' ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: "'Poppins', sans-serif",
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Poppins</span>
              {selectedFont === 'poppins' && <Check size={16} color="#6366f1" />}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Geometric, student-friendly rounded sans
            </div>
          </button>
        </div>
      </div>

      {/* Section 2: Student Identity & Profile */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} color="#6366f1" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Student Identity & Bio</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`} alt="Current Avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', background: 'rgba(255,255,255,0.05)' }} />
            <button 
              type="button" 
              onClick={() => {
                setAvatarSelection(user?.avatar || '');
                setAvatarFile(null);
                setAvatarPreview(null);
                setAvatarError(null);
                setShowAvatarModal(true);
              }} 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera size={14} /> Change Photo
            </button>
          </div>
        </div>

        {profileMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            background: profileMsg.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
            color: profileMsg.type === 'error' ? '#fb7185' : '#6ee7b7',
            fontSize: '0.85rem'
          }}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College / Institute</label>
            <input
              type="text"
              className="form-input"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio (Brief introduction for potential swap partners)</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#6ee7b7' }}>
              Skills You Can Teach (comma separated)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python, UI/UX Design, Figma, Guitar"
              value={skillsToTeach}
              onChange={(e) => setSkillsToTeach(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#a5b4fc' }}>
              Skills You Want to Learn (comma separated)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, Data Structures, Machine Learning"
              value={skillsToLearn}
              onChange={(e) => setSkillsToLearn(e.target.value)}
            />
          </div>

          <button type="submit" disabled={savingProfile} className="btn btn-primary btn-sm" style={{ padding: '8px 20px' }}>
            <Save size={15} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* CV / Resume Builder Feature */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={18} color="#f59e0b" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>CV / Resume Builder</h3>
          </div>
          <button type="button" onClick={handlePrintCV} className="btn btn-emerald btn-sm">
            Print to PDF
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Add your work experience and projects below. These will be combined with your Student Identity data above when you print your CV. Make sure to click "Save Profile Changes" above after editing these sections.
        </p>

        {/* Experience Editor */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Work Experience</h4>
            <button type="button" onClick={handleAddExperience} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
              + Add Experience
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {experience.map((exp, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'relative' }}>
                <button type="button" onClick={() => handleRemoveExperience(idx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✕ Remove</button>
                <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Job Title</label>
                    <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={exp.title} onChange={(e) => handleChangeExperience(idx, 'title', e.target.value)} placeholder="e.g. Frontend Developer Intern" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Company</label>
                    <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={exp.company} onChange={(e) => handleChangeExperience(idx, 'company', e.target.value)} placeholder="e.g. Google" />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Duration</label>
                  <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={exp.duration} onChange={(e) => handleChangeExperience(idx, 'duration', e.target.value)} placeholder="e.g. June 2025 - Present" />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                  <textarea className="form-textarea" rows={2} style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={exp.description} onChange={(e) => handleChangeExperience(idx, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements..." />
                </div>
              </div>
            ))}
            {experience.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No experience added yet.</p>}
          </div>
        </div>

        {/* Projects Editor */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Projects</h4>
            <button type="button" onClick={handleAddProject} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
              + Add Project
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map((proj, idx) => (
              <div key={idx} style={{ padding: '16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'relative' }}>
                <button type="button" onClick={() => handleRemoveProject(idx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✕ Remove</button>
                <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Project Title</label>
                    <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={proj.title} onChange={(e) => handleChangeProject(idx, 'title', e.target.value)} placeholder="e.g. CampusFlow" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Link (Optional)</label>
                    <input type="text" className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={proj.link} onChange={(e) => handleChangeProject(idx, 'link', e.target.value)} placeholder="e.g. github.com/username/project" />
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                  <textarea className="form-textarea" rows={2} style={{ padding: '6px 10px', fontSize: '0.85rem' }} value={proj.description} onChange={(e) => handleChangeProject(idx, 'description', e.target.value)} placeholder="Describe what the project does and technologies used..." />
                </div>
              </div>
            ))}
            {projects.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No projects added yet.</p>}
          </div>
        </div>
      </div>

      {/* Hidden CV DOM for Printing */}
      <div id="printable-cv" style={{ display: 'none' }}>
        <h1>{name || 'Student Name'}</h1>
        <div class="header-info">
          {user?.email} • {year} • {college || 'Engineering Institute'}
        </div>
        
        {bio && (
          <>
            <h2>Profile Summary</h2>
            <p>{bio}</p>
          </>
        )}

        <h2>Skills</h2>
        <div>
          {skillsToTeach.split(',').filter(Boolean).map((s, i) => <span key={i} class="badge">{s.trim()}</span>)}
          {skillsToLearn.split(',').filter(Boolean).map((s, i) => <span key={i} class="badge">{s.trim()} (Learning)</span>)}
        </div>

        {experience.length > 0 && (
          <>
            <h2>Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div class="item-meta">
                  <h3>{exp.title}</h3>
                  <span class="meta-light">{exp.duration}</span>
                </div>
                <p style={{ fontWeight: '500', marginBottom: '8px', color: '#4b5563' }}>{exp.company}</p>
                <p class="desc">{exp.description}</p>
              </div>
            ))}
          </>
        )}

        {projects.length > 0 && (
          <>
            <h2>Projects</h2>
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: '20px' }}>
                <div class="item-meta">
                  <h3>{proj.title}</h3>
                  {proj.link && <span class="meta-light"><a href={proj.link.startsWith('http') ? proj.link : `https://\${proj.link}`} target="_blank" rel="noreferrer">{proj.link}</a></span>}
                </div>
                <p class="desc">{proj.description}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Section 3: Password Security with Eye Toggles */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <Lock size={18} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Security & Password</h3>
        </div>

        {passwordMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            background: passwordMsg.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
            color: passwordMsg.type === 'error' ? '#fb7185' : '#6ee7b7',
            fontSize: '0.85rem'
          }}>
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ paddingRight: '38px' }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                aria-label={showCurrentPw ? "Hide current password" : "Show current password"}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '11px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  aria-label={showNewPw ? "Hide new password" : "Show new password"}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '11px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  aria-label={showConfirmPw ? "Hide confirm password" : "Show confirm password"}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '11px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <button type="submit" disabled={savingPassword} className="btn btn-secondary btn-sm" style={{ padding: '8px 20px' }}>
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Feature 26: One Device -> One Account Manager */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Smartphone size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.25rem' }}>Single Device Session Protection</h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          CampusFlow enforces basic active session protection. If your account is accessed from another browser or device, your current session will automatically terminate to protect your credits and student data.
        </p>

        <div style={{
          padding: '14px 18px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Current Browser / Device Identifier:</p>
            <p style={{ fontSize: '0.78rem', color: '#a5b4fc', fontFamily: 'monospace', marginTop: '2px' }}>
              {deviceId}
            </p>
          </div>
          <span className="badge badge-emerald">
            ✓ Active & Linked Session
          </span>
        </div>
      </div>

      {/* Credit Ledger / Transactions History */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.25rem' }}>Credit Transaction History</h3>
          </div>
          <span className="badge badge-amber" style={{ fontSize: '0.9rem' }}>
            Balance: {creditLedger.currentBalance} Credits
          </span>
        </div>

        {creditLedger.transactions?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {creditLedger.transactions.map((t) => (
              <div key={t._id} style={{
                padding: '12px 16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.description}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
                <span style={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: t.amount > 0 ? '#10b981' : '#f43f5e'
                }}>
                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No credit transactions logged.</p>
        )}
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ padding: '24px', width: '90%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setShowAvatarModal(false)} style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={20} color="#6366f1" /> Change Profile Photo
            </h3>
            
            {avatarError && <div style={{ color: '#fb7185', background: 'rgba(244,63,94,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{avatarError}</div>}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Predefined Avatars</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {PREDEFINED_AVATARS.map((url, i) => (
                  <img 
                    key={i} src={url} alt={`Avatar ${i+1}`}
                    onClick={() => { setAvatarSelection(url); setAvatarFile(null); setAvatarPreview(null); }}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', cursor: 'pointer', border: avatarSelection === url ? '3px solid #6366f1' : '3px solid transparent', background: 'rgba(255,255,255,0.05)' }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Custom Photo (JPG, PNG, WEBP)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={14} /> Upload File
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: 'none' }} onChange={handleFileChange} />
                </label>
                {avatarPreview && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={avatarPreview} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: avatarSelection === 'custom' ? '2px solid #6366f1' : 'none' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Preview</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowAvatarModal(false)} className="btn btn-secondary" disabled={avatarUploading}>Cancel</button>
              <button onClick={handleSaveAvatar} className="btn btn-primary" disabled={avatarUploading || (!avatarFile && !PREDEFINED_AVATARS.includes(avatarSelection))}>
                {avatarUploading ? 'Saving...' : 'Save Avatar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
