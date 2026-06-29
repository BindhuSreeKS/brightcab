import React, { useEffect, useState, useRef } from 'react';
import { 
  MessageSquare, Send, RefreshCw, AlertTriangle, 
  User, Clock, ShieldCheck, MapPin, Navigation, 
  HelpCircle, Star, RotateCcw, AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent, StatsCard, Badge, Button } from '../../components/ui';
import { whatsappBotApi } from '../../lib/api';
import { Client } from '@stomp/stompjs';
import toast from 'react-hot-toast';

interface ChatMessage {
  direction: 'incoming' | 'outgoing';
  from?: string;
  to?: string;
  type: string;
  textBody: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  whatsappPhone: string;
  customerId?: string;
  customerName?: string;
  state: string;
  tempPickupAddress?: string;
  tempPickupLat?: number;
  tempPickupLng?: number;
  tempDropAddress?: string;
  tempDropLat?: number;
  tempDropLng?: number;
  tempFare?: number;
  tempDistance?: number;
  tempDuration?: number;
  tempVehicleCategory?: string;
  activeRideId?: string;
  lastMessageAt?: string;
}

export default function WhatsAppBot() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [stats, setStats] = useState<any>({
    totalSessions: 0,
    idleSessions: 0,
    activeBookings: 0,
    supportTickets: 0
  });
  const [selectedSessionPhone, setSelectedSessionPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stompClientRef = useRef<Client | null>(null);

  // Fetch initial data
  const fetchData = async (showToast = false) => {
    setLoading(true);
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        whatsappBotApi.getSessions(),
        whatsappBotApi.getStats()
      ]);
      setSessions(sessionsRes.data || []);
      setStats(statsRes.data || {
        totalSessions: 0,
        idleSessions: 0,
        activeBookings: 0,
        supportTickets: 0
      });
      if (showToast) {
        toast.success('Stats and sessions synced!');
      }
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to sync chatbot data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Scroll to bottom of chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedSessionPhone]);

  // Connect to STOMP Broker over raw WebSocket
  useEffect(() => {
    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    // Match local port or target backend port
    const brokerUrl = `${wsProto}://${window.location.hostname}:8080/api/ws`;

    const client = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      console.log('Connected to Stomp Broker');
      setWsConnected(true);
      
      client.subscribe('/topic/admin/whatsapp', (message) => {
        const payload = JSON.parse(message.body) as ChatMessage;
        const phone = payload.direction === 'incoming' ? payload.from : payload.to;
        
        if (phone) {
          setMessages(prev => {
            const list = prev[phone] || [];
            return {
              ...prev,
              [phone]: [...list, payload]
            };
          });

          // Refresh the sessions and stats in background to get new states
          fetchData();
        }
      });
    };

    client.onDisconnect = () => {
      console.log('Disconnected from Stomp Broker');
      setWsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
      setWsConnected(false);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSessionPhone || !inputValue.trim()) return;

    const messageText = inputValue.trim();
    setInputValue('');

    try {
      await whatsappBotApi.sendMessage(selectedSessionPhone, messageText);
      // Wait for WS to broadcast it and append it. If WS is down, we manually append:
      if (!wsConnected) {
        const manualMsg: ChatMessage = {
          direction: 'outgoing',
          to: selectedSessionPhone,
          type: 'text',
          textBody: messageText,
          timestamp: Date.now()
        };
        setMessages(prev => {
          const list = prev[selectedSessionPhone] || [];
          return {
            ...prev,
            [selectedSessionPhone]: [...list, manualMsg]
          };
        });
      }
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  const handleResetSession = async (phone: string) => {
    if (!window.confirm(`Are you sure you want to reset session for ${phone}?`)) return;
    try {
      await whatsappBotApi.resetSession(phone);
      toast.success('Session reset successfully!');
      fetchData();
    } catch (err) {
      toast.error('Failed to reset session.');
    }
  };

  const selectedSession = sessions.find(s => s.whatsappPhone === selectedSessionPhone);
  const activeChatMessages = selectedSessionPhone ? (messages[selectedSessionPhone] || []) : [];

  const getStateColor = (state: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'outline' => {
    switch (state) {
      case 'IDLE': return 'default';
      case 'MAIN_MENU': return 'secondary';
      case 'AWAITING_PICKUP': return 'warning';
      case 'AWAITING_DROP': return 'info';
      case 'AWAITING_CONFIRMATION': return 'warning';
      case 'RIDE_ACTIVE': return 'success';
      case 'SUPPORT': return 'error';
      case 'AWAITING_RATING': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-100px)] overflow-hidden pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-[#25D366]" />
            WhatsApp Bot Monitor
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitor and manage live WhatsApp cab bookings and customer sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => fetchData(true)} className="flex gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Dashboard
          </Button>
          <Badge variant={wsConnected ? 'success' : 'error'} className="flex items-center gap-2 py-2 px-3">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span>{wsConnected ? 'Live Connection Active' : 'Disconnected (STOMP Down)'}</span>
          </Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={MessageSquare}
          color="green"
        />
        <StatsCard
          title="Active Booking Sessions"
          value={stats.activeBookings}
          icon={Navigation}
          color="indigo"
        />
        <StatsCard
          title="Support Tickets"
          value={stats.supportTickets}
          icon={HelpCircle}
          color="rose"
        />
        <StatsCard
          title="Idle Conversations"
          value={stats.idleSessions}
          icon={Clock}
          color="slate"
        />
      </div>

      {/* Main Split Window */}
      <div className="flex gap-6 h-[calc(100vh-320px)] min-h-0">
        {/* Left Side: Sessions List */}
        <div className="w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Active Chat Sessions</span>
            <Badge variant="info">{sessions.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 opacity-45" />
                <span>No active chat sessions</span>
              </div>
            ) : (
              sessions.map(s => {
                const isActive = s.whatsappPhone === selectedSessionPhone;
                const lastMsgTime = s.lastMessageAt ? new Date(s.lastMessageAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <div 
                    key={s.whatsappPhone}
                    onClick={() => setSelectedSessionPhone(s.whatsappPhone)}
                    className={`p-4 transition-colors cursor-pointer text-left flex flex-col gap-2 ${
                      isActive 
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-l-4 border-[#25D366]' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        +{s.whatsappPhone}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {lastMsgTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                        {s.customerName || 'WhatsApp User'}
                      </span>
                      <Badge variant={getStateColor(s.state)} className="text-[9px] uppercase tracking-wide px-1.5 py-0">
                        {s.state.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Middle: Chat box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-sm">
          {selectedSession ? (
            <>
              {/* Active Session Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-[#25D366] font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">+{selectedSession.whatsappPhone}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{selectedSession.customerName || 'WhatsApp User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-slate-600 dark:text-slate-400 hover:text-rose-500"
                    onClick={() => handleResetSession(selectedSession.whatsappPhone)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    Reset State
                  </Button>
                </div>
              </div>

              {/* Message window */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/20 space-y-4 custom-scrollbar flex flex-col">
                <div className="text-center py-2">
                  <span className="px-2.5 py-1 bg-slate-200 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 rounded-full font-bold uppercase tracking-wider">
                    Session Start State: {selectedSession.state}
                  </span>
                </div>

                {activeChatMessages.length === 0 && (
                  <div className="text-center text-slate-400 text-xs my-auto py-12 flex flex-col items-center gap-2">
                    <MessageSquare className="w-10 h-10 opacity-30 animate-pulse text-[#25D366]" />
                    <span>Live conversation log starting... Send a manual message below to begin override.</span>
                  </div>
                )}

                {activeChatMessages.map((msg, i) => {
                  const isOutgoing = msg.direction === 'outgoing';
                  const time = new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[75%] gap-1 ${
                        isOutgoing ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div 
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOutgoing 
                            ? 'bg-[#25D366] text-white rounded-tr-none font-medium' 
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                        }`}
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {msg.textBody}
                      </div>
                      <span className="text-[9px] text-slate-400 font-semibold px-1">
                        {time}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2 shrink-0">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type an override response to send via WhatsApp..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#25D366] dark:text-white"
                />
                <Button type="submit" className="bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl px-4 py-2.5 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 gap-4">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <div className="max-w-xs">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-1">No Chat Selected</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Select an active session from the left sidebar list to monitor its real-time conversational flow.</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Session State Diagnostics */}
        {selectedSession && (
          <div className="w-80 shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col min-h-0 overflow-y-auto custom-scrollbar shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Diagnostics & State</span>
            </div>
            
            <div className="p-4 space-y-6 text-left">
              {/* Session State */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Bot State</h4>
                <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-75 rounded-xl">
                  <Badge variant={getStateColor(selectedSession.state)} className="uppercase text-[10px]">
                    {selectedSession.state.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    Active state
                  </span>
                </div>
              </div>

              {/* Ride Mapping */}
              {selectedSession.activeRideId && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Active Booking</h4>
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">Ride ID</span>
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        #{selectedSession.activeRideId.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <Button 
                      onClick={() => window.location.href = `/admin/tracking?rideId=${selectedSession.activeRideId}`}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 text-xs rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Track on Live Map
                    </Button>
                  </div>
                </div>
              )}

              {/* Location Data */}
              {(selectedSession.tempPickupAddress || selectedSession.tempDropAddress) && (
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Routing Data</h4>
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-75 p-3 rounded-xl">
                    {selectedSession.tempPickupAddress && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-[#25D366]">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>PICKUP ADDRESS</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5 font-semibold">
                          {selectedSession.tempPickupAddress}
                        </p>
                      </div>
                    )}
                    {selectedSession.tempDropAddress && (
                      <div className="space-y-1 border-t border-slate-200 dark:border-slate-800 pt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500">
                          <Navigation className="w-3.5 h-3.5" />
                          <span>DROP ADDRESS</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5 font-semibold">
                          {selectedSession.tempDropAddress}
                        </p>
                      </div>
                    )}

                    {selectedSession.tempFare && (
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">ESTIMATED FARE</span>
                          <p className="font-bold text-slate-800 dark:text-white">₹{selectedSession.tempFare}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-medium">DISTANCE</span>
                          <p className="font-bold text-slate-800 dark:text-white">{selectedSession.tempDistance?.toFixed(1)} km</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Template Responses */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Quick Override Shortcuts</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => setInputValue("Welcome back to Vazraa Cabs! How can we help you? Type 'menu' to display choices.")}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-75 truncate block"
                  >
                    Welcome Back Message
                  </button>
                  <button 
                    onClick={() => setInputValue("Sorry, we couldn't match you with a driver at this moment. Would you like us to try again? Reply 1 for Yes, 2 to Cancel.")}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-75 truncate block"
                  >
                    Fallback Matching Retry
                  </button>
                  <button 
                    onClick={() => setInputValue("Your driver has arrived! Please board the vehicle and share the OTP. Enjoy your ride.")}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 rounded-lg border border-slate-200 dark:border-slate-75 truncate block"
                  >
                    Driver Arrival Alert
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
