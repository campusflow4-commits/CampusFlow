import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { api } from '../services/api.js';
import { 
  MessageSquare, 
  Send, 
  User, 
  Circle, 
  Clock, 
  Search, 
  Smile, 
  Sparkles 
} from 'lucide-react';

export const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('user');

  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch all conversations on mount & support ?user= query param
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
            // Target user is not in existing conversation list yet (e.g. freshly accepted swap)
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
              console.error('Failed to initialize direct chat with user:', err);
              if (data.length > 0) setActivePartner(data[0].participant);
            }
          }
        } else if (data.length > 0 && !activePartner) {
          setActivePartner(data[0].participant);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadConversations();
    return () => { isMounted = false; };
  }, [targetUserId]);

  // 2. Fetch messages when active partner changes
  useEffect(() => {
    if (!activePartner) return;

    const loadMessages = async () => {
      try {
        const data = await api.get(`/chat/messages/${activePartner._id}`);
        setMessages(data.messages || []);
        scrollToBottom();

        // Clear unread count for this conversation in state & notify navbar
        setConversations(prev => prev.map(c => 
          c.participant?._id === activePartner._id ? { ...c, unreadCount: 0 } : c
        ));
        window.dispatchEvent(new CustomEvent('campusflow:refresh_notifications'));

        // Join room via socket
        if (socket && user) {
          socket.emit('join_chat', { userId: user._id, targetUserId: activePartner._id });
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadMessages();
  }, [activePartner?._id, socket]);

  // 3. Socket real-time message receiver
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      // If message is from or to current active partner, append to conversation
      if (
        (msg.senderId === activePartner?._id && msg.receiverId === user?._id) ||
        (msg.senderId === user?._id && msg.receiverId === activePartner?._id)
      ) {
        setMessages(prev => [...prev, {
          _id: 'temp_' + Date.now(),
          sender: { _id: msg.senderId, name: msg.senderName, avatar: msg.senderAvatar },
          text: msg.text,
          createdAt: msg.createdAt
        }]);
        scrollToBottom();
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activePartner?._id, user?._id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartner) return;

    const textToSend = inputText.trim();
    setInputText('');

    try {
      // 1. Send via REST for MongoDB persistence
      const savedMsg = await api.post('/chat/send', {
        receiverId: activePartner._id,
        text: textToSend
      });

      // 2. Broadcast via Socket.IO
      if (socket) {
        socket.emit('send_message', {
          senderId: user._id,
          receiverId: activePartner._id,
          text: textToSend,
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

  return (
    <div className="container" style={{ padding: '36px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div className="badge badge-primary" style={{ marginBottom: '10px' }}>
          <MessageSquare size={14} /> Socket.IO Real-Time Peer Chat
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Direct <span className="text-gradient">Messaging</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Coordinate skill exchange meetings, share study links, and resolve doubts in real-time.
        </p>
      </div>

      {/* Chat Layout: Left List + Right Conversation */}
      <div className="glass-card" style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        height: '620px',
        overflow: 'hidden'
      }}>
        {/* Left Column: Conversations */}
        <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Peer Conversations</h3>
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
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      borderLeft: isSelected ? '4px solid #6366f1' : '4px solid transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <img
                        src={partner.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${partner.name}`}
                        alt=""
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <Circle
                        size={10}
                        color={online ? '#10b981' : '#64748b'}
                        fill={online ? '#10b981' : '#64748b'}
                        style={{ position: 'absolute', bottom: '0', right: '0' }}
                      />
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{partner.name}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {conv.unreadCount > 0 && (
                            <span style={{
                              background: '#f43f5e',
                              color: '#ffffff',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              borderRadius: '999px',
                              padding: '1px 6px',
                              lineHeight: '1.2'
                            }}>
                              {conv.unreadCount}
                            </span>
                          )}
                          <span style={{ fontSize: '0.7rem', color: online ? '#10b981' : 'var(--text-muted)' }}>
                            {online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {conv.lastMessage?.text || `${partner.year} student`}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No active conversations yet. Send a skill swap proposal from the Skill Exchange tab!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        {activePartner ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-surface)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={activePartner.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${activePartner.name}`}
                  alt=""
                  style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{activePartner.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {activePartner.year} • {isUserOnline(activePartner._id) ? <span style={{ color: '#10b981' }}>Active now</span> : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length > 0 ? (
                messages.map((m, idx) => {
                  const isMine = (m.sender?._id || m.sender) === user?._id;

                  return (
                    <div
                      key={m._id || idx}
                      style={{
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMine ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        padding: '10px 16px',
                        borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isMine ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'var(--bg-surface)',
                        color: isMine ? '#ffffff' : 'var(--text-primary)',
                        fontSize: '0.92rem',
                        lineHeight: 1.45,
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {m.text}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Sparkles size={24} style={{ margin: '0 auto 8px auto', color: '#6366f1' }} />
                  <p>Start your peer learning session with {activePartner.name}!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} style={{
              padding: '14px 18px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '10px',
              background: 'var(--bg-card)'
            }}>
              <input
                type="text"
                placeholder={`Message ${activePartner.name}...`}
                className="form-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
                <Send size={16} /> Send
              </button>
            </form>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select a student on the left to begin chatting.
          </div>
        )}
      </div>
    </div>
  );
};
