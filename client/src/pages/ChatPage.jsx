import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { api } from '../services/api.js';
import { 
  Send, Circle, Search, Smile, Paperclip, Video, X, File, Download, 
  MoreVertical, Edit2, Trash2, Phone, Camera, Mic, ChevronLeft
} from 'lucide-react';

export const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');
  const navigate = useNavigate();

  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Attachments & Recording
  const fileInputRef = useRef(null);
  const [attachment, setAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const videoPreviewRef = useRef(null);
  
  // Edit & Delete
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Video Call
  const [callState, setCallState] = useState({
    status: 'idle', // idle, calling, incoming, connected
    signal: null,
    caller: null, // {id, name}
  });
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let isMounted = true;
    const loadConversations = async () => {
      try {
        const data = await api.get('/chat/conversations');
        if (!isMounted) return;
        setConversations(data);
        if (targetUserId) {
          const existing = data.find(c => c.participant?._id === targetUserId);
          if (existing) {
            setActivePartner(existing.participant);
          } else {
            try {
              const directChat = await api.get(`/chat/messages/${targetUserId}`);
              if (isMounted && directChat.targetUser) {
                setActivePartner(directChat.targetUser);
                setConversations(prev => {
                  if (prev.some(c => c.participant?._id === targetUserId)) return prev;
                  return [{
                    _id: directChat.conversationId,
                    participant: directChat.targetUser,
                    lastMessage: null,
                    unreadCount: 0,
                    updatedAt: new Date()
                  }, ...prev];
                });
              }
            } catch (err) {
              if (data.length > 0) setActivePartner(data[0].participant);
            }
          }
        } else if (data.length > 0 && !activePartner) {
          setActivePartner(data[0].participant);
        }
      } catch (err) {} finally {
        if (isMounted) setLoading(false);
      }
    };
    loadConversations();
    return () => { isMounted = false; };
  }, [targetUserId]);

  useEffect(() => {
    if (!activePartner) return;
    const loadMessages = async () => {
      try {
        const data = await api.get(`/chat/messages/${activePartner._id}`);
        setMessages(data.messages || []);
        scrollToBottom();
        setConversations(prev => prev.map(c => 
          c.participant?._id === activePartner._id ? { ...c, unreadCount: 0 } : c
        ));
        window.dispatchEvent(new CustomEvent('campusflow:refresh_notifications'));
        if (socket && user) {
          socket.emit('join_chat', { userId: user._id, targetUserId: activePartner._id });
        }
      } catch (err) {}
    };
    loadMessages();
  }, [activePartner?._id, socket, user?._id]);

  // Socket setup
  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (msg) => {
      if ((msg.senderId === activePartner?._id && msg.receiverId === user?._id) ||
          (msg.senderId === user?._id && msg.receiverId === activePartner?._id)) {
        setMessages(prev => [...prev, {
          _id: msg._id || 'temp_' + Date.now(),
          sender: { _id: msg.senderId, name: msg.senderName, avatar: msg.senderAvatar },
          text: msg.text,
          messageType: msg.messageType,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileMimeType: msg.fileMimeType,
          fileSize: msg.fileSize,
          createdAt: msg.createdAt,
          isEdited: false,
          isDeleted: false
        }]);
        scrollToBottom();

        // Mark as read in backend since we are actively viewing it
        if (msg.senderId === activePartner?._id) {
          api.put(`/chat/read/${activePartner._id}`).catch(err => console.error(err));
        }
      }
    };
    const handleMessageEdited = ({ messageId, text }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, text, isEdited: true } : m));
    };
    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true } : m));
    };
    
    // WebRTC Signaling
    const handleCallIncoming = ({ signal, from, name }) => {
      setCallState({ status: 'incoming', signal, caller: { id: from, name } });
    };
    const handleCallAccepted = (signal) => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        setCallState(prev => ({ ...prev, status: 'connected' }));
      }
    };
    const handleCallRejected = () => {
      cleanupCall();
      alert('Call rejected');
    };
    const handleCallEnded = () => {
      cleanupCall();
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('call_incoming', handleCallIncoming);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('call_incoming', handleCallIncoming);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, activePartner?._id, user?._id]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      return alert('File size exceeds 50MB limit.');
    }
    setAttachment({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document'
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks(prev => [...prev, e.data]);
      };
      mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };
      setRecordedChunks([]);
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert('Could not access camera/microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setTimeout(() => {
        setRecordedChunks(prev => {
          if (prev.length > 0) {
            const blob = new Blob(prev, { type: 'video/webm' });
            setAttachment({
              file: new File([blob], `record-${Date.now()}.webm`, { type: 'video/webm' }),
              url: URL.createObjectURL(blob),
              type: 'video'
            });
          }
          return prev;
        });
      }, 500);
    }
  };

  const cancelAttachment = () => {
    if (attachment?.url) URL.revokeObjectURL(attachment.url);
    setAttachment(null);
    setRecordedChunks([]);
    setIsRecording(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadAttachment = async () => {
    const formData = new FormData();
    formData.append('file', attachment.file);
    const res = await api.uploadFile('/chat/upload', formData);
    return res;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;
    if (isRecording) return; 

    let fileData = null;
    if (attachment) {
      try {
        fileData = await uploadAttachment();
      } catch (err) {
        return alert('Failed to upload attachment');
      }
    }

    const payload = {
      receiverId: activePartner._id,
      text: inputText.trim(),
      messageType: fileData ? attachment.type : 'text',
      fileUrl: fileData?.fileUrl,
      fileName: fileData?.fileName,
      fileMimeType: fileData?.fileMimeType,
      fileSize: fileData?.fileSize
    };

    setInputText('');
    cancelAttachment();
    setEditingMessageId(null);

    try {
      const savedMsg = await api.post('/chat/send', payload);
      if (socket) {
        socket.emit('send_message', {
          _id: savedMsg._id,
          senderId: user._id,
          receiverId: activePartner._id,
          text: savedMsg.text,
          messageType: savedMsg.messageType,
          fileUrl: savedMsg.fileUrl,
          fileName: savedMsg.fileName,
          fileMimeType: savedMsg.fileMimeType,
          fileSize: savedMsg.fileSize,
          senderName: user.name,
          senderAvatar: user.avatar,
          createdAt: savedMsg.createdAt
        });
      }
      setMessages(prev => [...prev, savedMsg]);
      scrollToBottom();
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const handleEditMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    try {
      const updated = await api.patch(`/chat/messages/${editingMessageId}`, { text: inputText.trim() });
      setMessages(prev => prev.map(m => m._id === editingMessageId ? { ...m, text: updated.text, isEdited: true } : m));
      if (socket) {
        socket.emit('edit_message', { messageId: editingMessageId, senderId: user._id, receiverId: activePartner._id, text: updated.text });
      }
      setInputText('');
      setEditingMessageId(null);
    } catch (err) {
      alert('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/chat/messages/${id}`);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isDeleted: true } : m));
      if (socket) {
        socket.emit('delete_message', { messageId: id, senderId: user._id, receiverId: activePartner._id });
      }
    } catch (err) {
      alert('Failed to delete message');
    }
    setActiveMenuId(null);
  };

  // WebRTC Call Logic
  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setCallState({ status: 'calling', signal: null, caller: null });

      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          socket.emit('call_user', {
            userToCall: activePartner._id,
            signalData: pc.localDescription,
            from: user._id,
            name: user.name
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };
    } catch (err) {
      alert('Error accessing media devices.');
    }
  };

  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peerConnectionRef.current = pc;
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          socket.emit('answer_call', { to: callState.caller.id, signal: pc.localDescription });
        }
      };

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };

      await pc.setRemoteDescription(new RTCSessionDescription(callState.signal));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      setCallState(prev => ({ ...prev, status: 'connected' }));
    } catch (err) {
      alert('Error accessing media devices.');
    }
  };

  const rejectCall = () => {
    socket.emit('reject_call', { to: callState.caller.id });
    setCallState({ status: 'idle', signal: null, caller: null });
  };

  const endCall = () => {
    const targetId = callState.status === 'incoming' ? callState.caller.id : activePartner._id;
    socket.emit('end_call', { to: targetId });
    cleanupCall();
  };

  const cleanupCall = () => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    if (peerConnectionRef.current) peerConnectionRef.current.close();
    setCallState({ status: 'idle', signal: null, caller: null });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ height: 'calc(100vh - 80px)', padding: '20px', boxSizing: 'border-box' }}>
      
      {/* Video Call Overlay */}
      {callState.status !== 'idle' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.9)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff'
        }}>
          <h2 style={{ marginBottom: '20px', fontWeight: 600 }}>{callState.status === 'incoming' ? `Incoming call from ${callState.caller.name}...` : 'Video Call'}</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', margin: '20px 0' }}>
            {/* Local Video */}
            <div style={{ position: 'relative', width: '300px', height: '200px', background: '#111b21', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a3942' }}>
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(11, 20, 26, 0.7)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem' }}>You</div>
            </div>
            {/* Remote Video */}
            <div style={{ position: 'relative', width: '600px', height: '400px', background: '#111b21', borderRadius: '12px', overflow: 'hidden', border: '1px solid #2a3942', maxWidth: '90vw' }}>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(11, 20, 26, 0.7)', padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem' }}>
                {callState.caller?.name || activePartner?.name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            {callState.status === 'incoming' && (
              <button onClick={acceptCall} style={{ background: '#00a884', color: '#111b21', padding: '14px 32px', borderRadius: '32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600, boxShadow: '0 4px 12px rgba(0, 168, 132, 0.3)' }}>
                <Phone size={22} /> Accept
              </button>
            )}
            {callState.status === 'incoming' && (
              <button onClick={rejectCall} style={{ background: '#ef4444', color: '#fff', padding: '14px 32px', borderRadius: '32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600 }}>
                <Phone size={22} style={{ transform: 'rotate(135deg)' }} /> Reject
              </button>
            )}
            {(callState.status === 'calling' || callState.status === 'connected') && (
              <button onClick={endCall} style={{ background: '#ef4444', color: '#fff', padding: '14px 32px', borderRadius: '32px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', fontWeight: 600 }}>
                <Phone size={22} style={{ transform: 'rotate(135deg)' }} /> End Call
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Container Redesign */}
      <div style={{ 
        display: 'flex', 
        height: '100%', 
        background: '#111b21', // Dark navy WhatsApp style
        borderRadius: '16px', 
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        color: '#e9edef'
      }}>
        
        {/* Left Sidebar: Conversations */}
        <div style={{ 
          width: '340px', 
          borderRight: '1px solid #222d34', 
          display: 'flex', 
          flexDirection: 'column', 
          background: '#111b21',
          flexShrink: 0 
        }}>
          <div style={{ 
            padding: '16px 20px', 
            background: '#202c33', 
            display: 'flex', 
            alignItems: 'center',
            height: '64px',
            boxSizing: 'border-box'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Chats</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const partner = conv.participant;
                const isSelected = activePartner?._id === partner._id;
                const online = isUserOnline(partner._id);

                return (
                  <div
                    key={conv._id}
                    onClick={() => setActivePartner(partner)}
                    style={{
                      padding: '12px 16px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '14px', 
                      cursor: 'pointer',
                      background: isSelected ? '#2a3942' : 'transparent',
                      borderBottom: '1px solid #222d34',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.background = '#202c33'; }}
                    onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={partner.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner.name}`}
                        alt=""
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <Circle size={12} color={online ? '#00a884' : '#8696a0'} fill={online ? '#00a884' : '#8696a0'} style={{ position: 'absolute', bottom: '2px', right: '0', border: '2px solid #111b21', borderRadius: '50%' }} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <p style={{ fontWeight: 500, fontSize: '1rem', margin: 0, color: '#e9edef', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {partner.name}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span style={{ background: '#00a884', color: '#111b21', fontSize: '0.75rem', fontWeight: 600, borderRadius: '10px', padding: '2px 6px', minWidth: '18px', textAlign: 'center' }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#8696a0', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {conv.lastMessage?.text || (conv.lastMessage?.messageType ? `[${conv.lastMessage.messageType}]` : `${partner.year} student`)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#8696a0', fontSize: '0.9rem' }}>
                No active conversations yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Chat Window */}
        {activePartner ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#0b141a', position: 'relative' }}>
            
            {/* Chat Header */}
            <div style={{ 
              padding: '10px 16px', 
              background: '#202c33', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              height: '64px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                <div onClick={() => navigate(-1)} style={{ display: 'none', color: '#aebac1' }} className="mobile-back">
                  <ChevronLeft size={24} />
                </div>
                <img src={activePartner.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activePartner.name}`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 500, margin: 0, color: '#e9edef' }}>{activePartner.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#8696a0', margin: 0, marginTop: '2px' }}>
                    {activePartner.year} • {isUserOnline(activePartner._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#aebac1' }}>
                <button title="Search" style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  <Search size={20} />
                </button>
                <button 
                  title="Video Call" 
                  onClick={startCall} 
                  style={{ 
                    background: '#00a884', // Bright green/blue accent for visibility
                    border: 'none', 
                    color: '#111b21', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '8px',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0, 168, 132, 0.4)'
                  }}
                >
                  <Video size={20} />
                </button>
                <button title="Voice Call" style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  <Phone size={20} />
                </button>
                <button title="Menu" style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', padding: 0 }}>
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              padding: '20px 40px', 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              backgroundImage: 'url("https://transparenttextures.com/patterns/stardust.png")', // subtle texture
              backgroundBlendMode: 'overlay',
              backgroundColor: '#0b141a'
            }}>
              {messages.map((m) => {
                const isMine = (m.sender?._id || m.sender) === user?._id;
                
                return (
                  <div key={m._id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '65%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Message Bubble */}
                    <div 
                      onMouseEnter={() => {
                        const el = document.getElementById(`menu-trigger-${m._id}`);
                        if (el) el.style.opacity = '1';
                      }}
                      onMouseLeave={() => {
                        const el = document.getElementById(`menu-trigger-${m._id}`);
                        if (el && activeMenuId !== m._id) el.style.opacity = '0';
                      }}
                      style={{
                        padding: m.isDeleted ? '8px 12px' : (m.messageType !== 'text' ? '4px' : '6px 8px 8px 10px'),
                        borderRadius: '8px',
                        borderTopRightRadius: isMine ? '0' : '8px',
                        borderTopLeftRadius: !isMine ? '0' : '8px',
                        background: m.isDeleted ? 'transparent' : (isMine ? '#005c4b' : '#202c33'), // WhatsApp dark sent/received
                        border: m.isDeleted ? '1px italic #222d34' : 'none',
                        color: m.isDeleted ? '#8696a0' : '#e9edef',
                        fontSize: '0.93rem',
                        lineHeight: 1.4,
                        boxShadow: m.isDeleted ? 'none' : '0 1px 0.5px rgba(11,20,26,.13)',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '100px'
                      }}
                    >
                      {/* Menu Trigger (Chevron) */}
                      {isMine && !m.isDeleted && (
                        <div 
                          id={`menu-trigger-${m._id}`}
                          style={{ position: 'absolute', top: '4px', right: '8px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', opacity: activeMenuId === m._id ? '1' : '0', transition: 'opacity 0.2s', padding: '2px', background: isMine ? 'linear-gradient(90deg, transparent, #005c4b 40%)' : 'transparent', zIndex: 2 }} 
                          onClick={() => setActiveMenuId(activeMenuId === m._id ? null : m._id)}
                        >
                          <MoreVertical size={14} />
                        </div>
                      )}
                      
                      {/* Menu Dropdown */}
                      {activeMenuId === m._id && isMine && !m.isDeleted && (
                        <div style={{ position: 'absolute', top: '24px', right: '0', background: '#233138', borderRadius: '4px', padding: '4px 0', zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.3)', minWidth: '120px' }}>
                          {m.messageType === 'text' && (
                            <div onClick={() => { setEditingMessageId(m._id); setInputText(m.text); setActiveMenuId(null); }} style={{ padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', color: '#e9edef' }}><Edit2 size={14}/> Edit</div>
                          )}
                          <div onClick={() => handleDeleteMessage(m._id)} style={{ padding: '10px 16px', fontSize: '0.9rem', cursor: 'pointer', color: '#e9edef', display: 'flex', alignItems: 'center', gap: '10px' }}><Trash2 size={14}/> Delete</div>
                        </div>
                      )}

                      {/* Content */}
                      {m.isDeleted ? (
                        <i style={{ color: '#8696a0', fontSize: '0.85rem' }}>This message was deleted</i>
                      ) : (
                        <div style={{ paddingRight: (m.messageType === 'text' ? '30px' : '0') }}>
                          {m.messageType === 'text' && <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{m.text}</div>}
                          {m.messageType === 'image' && (
                            <div style={{ borderRadius: '6px', overflow: 'hidden', background: '#111b21' }}>
                              <img src={`http://localhost:5000${m.fileUrl}`} alt={m.fileName} style={{ maxWidth: '100%', maxHeight: '250px', display: 'block', objectFit: 'contain' }} />
                              {m.text && <div style={{ padding: '6px 8px', fontSize: '0.9rem' }}>{m.text}</div>}
                            </div>
                          )}
                          {m.messageType === 'video' && (
                            <div style={{ borderRadius: '6px', overflow: 'hidden', background: '#111b21' }}>
                              <video src={`http://localhost:5000${m.fileUrl}`} controls style={{ maxWidth: '100%', maxHeight: '250px', display: 'block', outline: 'none' }} />
                              {m.text && <div style={{ padding: '6px 8px', fontSize: '0.9rem' }}>{m.text}</div>}
                            </div>
                          )}
                          {m.messageType === 'document' && (
                            <a href={`http://localhost:5000${m.fileUrl}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', color: '#e9edef', textDecoration: 'none', margin: '2px' }}>
                              <div style={{ background: '#ef4444', padding: '10px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <File size={20} color="#fff" />
                              </div>
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{m.fileName}</div>
                                <div style={{ fontSize: '0.8rem', color: '#8696a0' }}>{formatFileSize(m.fileSize)}</div>
                              </div>
                              <Download size={18} color="#aebac1" style={{ marginLeft: '8px' }} />
                            </a>
                          )}
                        </div>
                      )}
                      
                      {/* Timestamp & Meta */}
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: m.isDeleted ? '#8696a0' : 'rgba(255,255,255,0.6)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        alignSelf: 'flex-end',
                        marginTop: m.messageType === 'text' ? '-10px' : '4px',
                        marginRight: m.messageType === 'text' ? '0' : '4px'
                      }}>
                        {m.isEdited && <span>Edited</span>}
                        <span>{new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment & Recording Previews */}
            {(attachment || isRecording) && (
              <div style={{ padding: '10px 16px', background: '#202c33', borderTop: '1px solid #222d34' }}>
                {attachment && (
                  <div style={{ padding: '8px 12px', background: '#2a3942', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', width: 'fit-content' }}>
                    {attachment.type === 'image' && <img src={attachment.url} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />}
                    {attachment.type === 'video' && <video src={attachment.url} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />}
                    {attachment.type === 'document' && <div style={{ width: '48px', height: '48px', background: '#ef4444', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><File size={24} color="#fff" /></div>}
                    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '200px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', color: '#e9edef' }}>{attachment.file.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8696a0' }}>{formatFileSize(attachment.file.size)}</div>
                    </div>
                    <button type="button" onClick={cancelAttachment} style={{ background: 'transparent', border: 'none', color: '#aebac1', cursor: 'pointer', padding: '4px', marginLeft: '8px' }}><X size={18} /></button>
                  </div>
                )}
                {isRecording && (
                  <div style={{ padding: '8px 12px', background: '#2a3942', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', width: 'fit-content' }}>
                    <video ref={videoPreviewRef} autoPlay muted style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '4px', background: '#000' }} />
                    <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}><Circle size={10} fill="#ef4444" /> Recording</div>
                    <button type="button" onClick={stopRecording} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, marginLeft: '8px' }}>Stop</button>
                    <button type="button" onClick={cancelAttachment} style={{ background: 'transparent', border: 'none', color: '#aebac1', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
                  </div>
                )}
              </div>
            )}

            {/* Input Area (Composer) */}
            <div style={{ 
              padding: '10px 16px', 
              background: '#202c33', 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: '12px',
              minHeight: '62px',
              boxSizing: 'border-box'
            }}>
              
              {!editingMessageId && (
                <div style={{ display: 'flex', gap: '4px', paddingBottom: '8px', color: '#aebac1' }}>
                  <button type="button" style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '6px' }}>
                    <Smile size={24} />
                  </button>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '6px' }} title="Attach File">
                    <Paperclip size={24} />
                  </button>
                </div>
              )}

              <form onSubmit={editingMessageId ? handleEditMessage : handleSendMessage} style={{ display: 'flex', flex: 1, gap: '12px', alignItems: 'center' }}>
                
                <div style={{ flex: 1, background: '#2a3942', borderRadius: '8px', display: 'flex', alignItems: 'center', padding: '9px 14px' }}>
                  <input
                    type="text"
                    placeholder={editingMessageId ? "Edit message..." : `Message ${activePartner.name}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    style={{ 
                      flex: 1, 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#e9edef', 
                      outline: 'none',
                      fontSize: '0.95rem'
                    }}
                  />
                  {!editingMessageId && !inputText.trim() && !attachment && (
                    <button type="button" onClick={startRecording} style={{ background: 'transparent', border: 'none', color: '#aebac1', cursor: 'pointer', padding: '0 4px', display: 'flex' }} title="Record Video">
                      <Camera size={22} />
                    </button>
                  )}
                </div>
                
                {editingMessageId ? (
                  <div style={{ display: 'flex', gap: '8px', paddingBottom: '2px' }}>
                    <button type="button" onClick={() => { setEditingMessageId(null); setInputText(''); }} style={{ background: 'transparent', border: 'none', color: '#aebac1', cursor: 'pointer', padding: '8px', fontWeight: 600 }}>Cancel</button>
                    <button type="submit" style={{ background: '#00a884', color: '#111b21', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Send size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    type="submit" 
                    disabled={isRecording || (!inputText.trim() && !attachment)}
                    style={{ 
                      background: (inputText.trim() || attachment) ? '#00a884' : '#2a3942', 
                      color: (inputText.trim() || attachment) ? '#111b21' : '#8696a0', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: '40px', 
                      height: '40px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: (inputText.trim() || attachment) ? 'pointer' : 'default',
                      transition: 'background 0.2s, color 0.2s',
                      flexShrink: 0
                    }}
                  >
                    {(inputText.trim() || attachment) ? <Send size={20} /> : <Mic size={20} />}
                  </button>
                )}
              </form>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, background: '#222d34', alignItems: 'center', justifyContent: 'center', color: '#8696a0', borderBottom: '6px solid #00a884' }}>
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=CampusFlow" alt="CampusFlow" style={{ width: '120px', opacity: 0.5, marginBottom: '20px' }} />
            <h2 style={{ fontWeight: 300, color: '#e9edef', marginBottom: '10px' }}>CampusFlow Web</h2>
            <p style={{ fontSize: '0.9rem' }}>Select a student to start your skill exchange session.</p>
          </div>
        )}
      </div>
    </div>
  );
};
