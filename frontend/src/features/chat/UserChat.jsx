import React, { useState, useEffect, useRef } from 'react';
import UserDetail from './UserDetail';
import axios from 'axios';
import ModeToggleButton from '../../components/buttons/ModeToggleButton';

const UserChat = ({ user, onBackToList, socket }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [isAiMode, setIsAiMode] = useState(0);


const handleModeToggle = async () => {
  const newTargetAiMode = !isAiMode;
  const newIsBotValueForBackend = newTargetAiMode;

  if (!user || !user.wa_id) {
    console.error("User WA ID is missing, cannot update mode.");
    return;
  }

  try {
    const response = await axios.put(
      `http://localhost:8000/users/${user.wa_id}/mode`,
      {
        is_bot: newIsBotValueForBackend
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Add Authorization header if your endpoint is protected
          // "Authorization": `Bearer ${your_auth_token}`
        },
      }
    );
    if (response.status === 200 && response.data && response.data.wa_id) {
      if (response.data.is_bot === newTargetAiMode) {
        setIsAiMode(newTargetAiMode); // Update frontend state
        console.log(
          `Successfully switched mode to: ${newTargetAiMode ? "AI" : "Human"} for user ${response.data.wa_id}`
        );
      } else {
        console.error(
          "Backend updated mode, but returned state mismatch. Expected:",
          newTargetAiMode,
          "Got:",
          response.data.is_bot
        );
      }
    } else {
      console.error(
        "Backend failed to update mode or returned unexpected data:",
        response.data || `Status: ${response.status}`
      );
    }
  } catch (err) {
    console.error('Error making API call to update mode:', err.response ? err.response.data : err.message);
  }
};


  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch initial chat history
  useEffect(() => {
    axios
      .get('http://localhost:8000/messages', {
        params: { wa_id: user.wa_id },
      })
      .then((res) => {
        const sortedMessages = (res.data || []).sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setIsAiMode(user.isBot)
        setMessages(
          sortedMessages.map((msg) => ({
            ...msg,
            timestamp_raw: new Date(msg.timestamp),
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }))
        );
      })
      .catch((err) => {
        console.error('Error fetching messages:', err);
        setMessages([]);
      });
  }, [user.wa_id]);


  // WebSocket message and status update handling
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msgPayload) => {
      console.log("Socket: received incoming_message", msgPayload);
      const currentChatWaId = user.wa_id;
      let belongsToCurrentChat = false;

      if (msgPayload.direction === 'incoming' && msgPayload.user_phone === currentChatWaId) {
        belongsToCurrentChat = true;
      } else if (msgPayload.direction === 'outgoing' && msgPayload.recipient_phone === currentChatWaId) {
        belongsToCurrentChat = true;
      }

      if (belongsToCurrentChat) {
        const receivedAt = new Date();
        const formattedMsg = {
          wa_message_id: msgPayload.wamid,
          text_content: msgPayload.wa_message,
          direction: msgPayload.direction,
          status: msgPayload.status || (msgPayload.direction === 'incoming' ? 'delivered' : 'sent'),
          timestamp_raw: receivedAt,
          timestamp: receivedAt.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          ...(msgPayload.direction === 'incoming' && { user_phone: msgPayload.user_phone }),
          ...(msgPayload.direction === 'outgoing' && { recipient_phone: msgPayload.recipient_phone }),
        };

        setMessages(prevMessages => {
          const existingMsgIndex = prevMessages.findIndex(m => m.wa_message_id === formattedMsg.wa_message_id);
          let updatedMessages;
          if (existingMsgIndex > -1) {
            updatedMessages = [...prevMessages];
            updatedMessages[existingMsgIndex] = { ...updatedMessages[existingMsgIndex], ...formattedMsg };
          } else {
            updatedMessages = [...prevMessages, formattedMsg];
          }
          return updatedMessages.sort((a, b) => a.timestamp_raw - b.timestamp_raw);
        });
      } else {
        console.log(`Socket: New message for another chat (user: ${msgPayload.user_phone || msgPayload.recipient_phone}, current: ${currentChatWaId})`);
      }
    };

    const handleStatusUpdate = (statusPayload) => {
      console.log("Socket: received message_status_update", statusPayload);
      // Make sure statusPayload.wa_id or equivalent field exists for chat identification
      if ((statusPayload.chat_wa_id || statusPayload.wa_id) === user.wa_id) {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.wa_message_id === statusPayload.wamid
              ? { ...msg, status: statusPayload.status }
              : msg
          )
        );
      }
    };

    socket.on("incoming_message", handleNewMessage);
    socket.on("ai_message", handleNewMessage);
    socket.on("message_status_update", handleStatusUpdate);

    return () => {
      socket.off("incoming_message", handleNewMessage);
      socket.off("message_status_update", handleStatusUpdate);
    };
  }, [socket, user.wa_id]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Example: If AI mode is on, prefix message or handle differently
    // This is just a placeholder for how you might use isAiMode
    let messageToSend = newMessage;
    if (isAiMode) {
      console.log("Sending message in AI Mode. Consider AI-specific handling.");
      // messageToSend = `[AI Query]: ${newMessage}`; // Example modification
    }

    const now = new Date();
    const optimisticMsg = {
      wa_message_id: `temp-${Date.now()}`,
      direction: 'outgoing',
      text_content: messageToSend, // Use potentially modified message
      timestamp_raw: now,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMsg].sort((a, b) => a.timestamp_raw - b.timestamp_raw));
    
    const capturedMessageText = messageToSend; // Capture before clearing
    setNewMessage('');

    try {
      // Consider sending the mode to the backend if it needs to react differently
      // const payload = {
      //   recipient_phone: user.wa_id,
      //   message_text: capturedMessageText,
      //   mode: isAiMode ? 'ai' : 'human' // Example
      // };
      // const response = await axios.post('http://localhost:8000/send', payload);
      const response = await axios.post('http://localhost:8000/messages', {
        recipient_phone: user.wa_id,
        message_text: capturedMessageText,
      });
      
      const wamid = response.data?.wamid;

      if (wamid) {
        setMessages(prev => prev.map(msg =>
          msg.wa_message_id === optimisticMsg.wa_message_id
            ? { ...msg, wa_message_id: wamid, status: 'sent' }
            : msg
        ).sort((a, b) => a.timestamp_raw - b.timestamp_raw));
      } else {
        setMessages(prev => prev.map(msg =>
          msg.wa_message_id === optimisticMsg.wa_message_id
            ? { ...msg, status: 'failed', error: response.data?.error || 'No wamid returned' }
            : msg
        ).sort((a, b) => a.timestamp_raw - b.timestamp_raw));
        console.error('Failed to send message, no wamid or API error:', response.data);
      }
    } catch (err) {
      console.error('Failed to send message via API:', err);
      setMessages(prev => prev.map(msg =>
        msg.wa_message_id === optimisticMsg.wa_message_id
          ? { ...msg, status: 'failed', error: err.message }
          : msg
      ).sort((a, b) => a.timestamp_raw - b.timestamp_raw));
    }
  };

  if (showProfile) {
    return <UserDetail user={user} onBackToChat={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-0 md:py-6">
      <div className="flex flex-col h-screen md:h-[calc(100vh-3rem)] w-full max-w-3xl bg-gray-100 shadow-2xl md:rounded-xl overflow-hidden">
        <header className="bg-white shadow-sm p-3 sm:p-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={onBackToList}
              className="mr-2 sm:mr-3 text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50"
              aria-label="Back to user list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center cursor-pointer" onClick={() => setShowProfile(true)}>
              <span className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-indigo-500 text-white text-base sm:text-lg font-bold mr-2 sm:mr-3">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </span>
              {/* Display user name next to avatar on larger screens */}
              <span className="font-semibold text-gray-700 hidden md:block">{user.name}</span>
            </div>
          </div>
          {/* Container for right-side buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4"> {/* Adjusted spacing */}
            <button
              onClick={() => setShowProfile(true)}
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 sm:py-2 sm:px-3 rounded-md hover:bg-indigo-50 transition-colors"
              aria-label="View user profile"
            >
              View Profile
            </button>
            {/*  Mode Toggle Button Here */}
            <ModeToggleButton isAiMode={isAiMode} onToggle={handleModeToggle} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div
              key={msg.wa_message_id}
              className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] sm:max-w-[65%] px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow ${
                  msg.direction === 'outgoing'
                    ? 'bg-indigo-500 text-white rounded-br-none'
                    : 'bg-white text-gray-700 rounded-bl-none border border-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text_content}</p>
                <div className="text-xs mt-1 flex justify-end items-center space-x-1">
                    <span className={`${msg.direction === 'outgoing' ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {msg.timestamp}
                    </span>
                    {msg.direction === 'outgoing' && (
                        <>
                            {msg.status === 'sending' && <span title="Sending...">🕒</span>}
                            {msg.status === 'sent' && <span title="Sent">✓</span>}
                            {msg.status === 'delivered' && <span title="Delivered">✓✓</span>}
                            {msg.status === 'read' && <span title="Read" style={{color: msg.direction === 'outgoing' ? '#60a5fa' : 'inherit'}}>✓✓</span>}
                            {msg.status === 'failed' && <span title="Failed to send" className="text-red-300">✗</span>}
                        </>
                    )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="bg-white p-2 sm:p-3 border-t border-gray-200 sticky bottom-0 z-10">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isAiMode ? "AI is active. Type for AI..." : "Type your message..."} // Dynamic placeholder
              className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-sm sm:text-base"
              // Example: Disable input if AI is fully autonomous and not taking user input
              // disabled={isAiMode && SOME_CONDITION_FOR_AI_AUTONOMY}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()} // Potentially also disable if AI mode requires no manual send
              className="p-2 sm:px-5 sm:py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              aria-label="Send message"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default UserChat;