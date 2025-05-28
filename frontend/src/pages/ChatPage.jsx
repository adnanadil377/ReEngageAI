// userchatlist.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import UserChat from '../features/chat/UserChat'; // Make sure UserChat.jsx exists
import socket from '../features/chat/socket';     // Make sure socket.js exists
import UserCard from '../features/chat/UserCard';
import Header from '../components/Header';
// Header is no longer imported or managed here; it's part of AppLayout

const ChatPage = () => {
  // const [activeTab, setActiveTab] = useState('chat'); // REMOVED
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState(null);
  const [selectedUserForChat, setSelectedUserForChat] = useState(null);

  useEffect(() => {
    // Fetch users only if no specific user is selected for chat.
    // This component is always the "chat" view when rendered.
    if (!selectedUserForChat) {
      setLoadingUsers(true);
      axios.get("http://localhost:8000/users")
        .then(res => {
          setUsers(res.data);
          setLoadingUsers(false);
        })
        .catch(err => {
          setUserError(err.message || "Failed to fetch users.");
          setLoadingUsers(false);
        });
    }
  }, [selectedUserForChat]); // Re-fetch or update based on chat selection

  // const handleTabChange = (tab) => { ... }; // REMOVED

  const renderChatListContent = () => {
    if (loadingUsers) return <div className="text-center py-10">Loading users...</div>;
    if (userError) return <div className="text-center py-10 text-red-500">Error: {userError}</div>;
    
    return (
      <div className='max-w-3xl pt-20 pb-10 mx-auto'>
        <Header />
        <header className="mb-8  text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
            Customer Chats
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Browse, search, and click on a customer to start a chat.
          </p>
        </header>
        <UserCard users={users} onUserClick={setSelectedUserForChat} />
      </div>
    );
  };

  // const renderDashboardContent = () => { ... }; // REMOVED

  return (
    // The surrounding div with bg-gradient and min-h-screen is now in AppLayout.
    // The pt-16 is handled by AppLayout's <main> tag.
    // This component now just returns its specific content for the /chat route.
    // Add page-specific padding here.
    <div className="py-0 px-0 sm:px-6 lg:px-8"> 
      {selectedUserForChat ? (
        <UserChat
          user={selectedUserForChat}
          onBackToList={() => setSelectedUserForChat(null)}
          socket={socket}
        />
      ) : (
        renderChatListContent()
      )}
    </div>
  );
};

export default ChatPage;
// // userchatlist.jsx
// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import UserChat from './UserChat'; // Make sure UserChat.jsx exists
// import socket from './socket';     // Make sure socket.js exists
// import UserCard from './UserCard';
// // Adjust this path if your Header.jsx is located elsewhere
// // For example, if Header.jsx is in src/components/Header.jsx
// // and UserChatList.jsx is in src/features/chat/UserChatList.jsx,
// // the path might be '../../components/Header';
// import Header from '../header'; // Assuming Header.jsx is in ../components/

// const UserChatList = () => {
//   const [activeTab, setActiveTab] = useState('chat'); // Default to 'chat'
//   const [users, setUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [userError, setUserError] = useState(null);
//   const [selectedUserForChat, setSelectedUserForChat] = useState(null);

//   useEffect(() => {
//     if (activeTab === 'chat' && !selectedUserForChat) {
//       setLoadingUsers(true);
//       axios.get("http://localhost:8000/user")
//         .then(res => {
//           setUsers(res.data);
//           setLoadingUsers(false);
//         })
//         .catch(err => {
//           setUserError(err.message || "Failed to fetch users.");
//           setLoadingUsers(false);
//         });
//     } else if (activeTab !== 'chat') {
//       setLoadingUsers(false); 
//       setUserError(null);
//     }
//   }, [activeTab, selectedUserForChat]);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setSelectedUserForChat(null); 
//   };

//   const renderChatListContent = () => {
//     if (loadingUsers) return <div className="text-center py-10">Loading users...</div>;
//     if (userError) return <div className="text-center py-10 text-red-500">Error: {userError}</div>;
    
//     return (
//       <div className='max-w-3xl mx-auto'>
//         <header className="mb-8 text-center">
//           <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
//             Customer Chats
//           </h1>
//           <p className="mt-3 text-lg text-gray-600">
//             Browse, search, and click on a customer to start a chat.
//           </p>
//         </header>
//         <UserCard users={users} onUserClick={setSelectedUserForChat} />
//       </div>
//     );
//   };

//   const renderDashboardContent = () => {
//     return (
//       <div className='max-w-3xl mx-auto text-center'>
//         <header className="mb-8 text-center">
//           <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
//             Dashboard
//           </h1>
//           <p className="mt-3 text-lg text-gray-600">
//             Welcome to your dashboard overview.
//           </p>
//         </header>
//         <p className="text-gray-700">Your dashboard components will appear here.</p>
//       </div>
//     );
//   };

//   return (
//     <div>
//       <Header activeTab={activeTab} onTabChange={handleTabChange} />
      
//       {/* Content Area: pt-16 (padding-top: 4rem or 64px) to offset fixed navbar's height (h-16) */}
//       <div className="pt-16"> {/* This is CRUCIAL for fixed navbar */}
//         {activeTab === 'chat' && (
//           selectedUserForChat ? (
//             <UserChat 
//               user={selectedUserForChat}
//               onBackToList={() => setSelectedUserForChat(null)}
//               socket={socket}
//             />
//           ) : (
//             <div className="py-8 px-4 sm:px-6 lg:px-8"> 
//               {renderChatListContent()}
//             </div>
//           )
//         )}
//         {activeTab === 'dashboard' && (
//           <div className="py-8 px-4 sm:px-6 lg:px-8">
//             {renderDashboardContent()}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserChatList;
// // userchatlist.jsx
// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import UserChat from './UserChat'; // Make sure UserChat.jsx exists
// import socket from './socket';     // Make sure socket.js exists
// import UserCard from './UserCard';
// import Header from '../header';   // Path to your header.jsx

// const UserChatList = () => {
//   const [activeTab, setActiveTab] = useState('chat'); // Default to 'chat'
//   const [users, setUsers] = useState([]);
//   const [loadingUsers, setLoadingUsers] = useState(true);
//   const [userError, setUserError] = useState(null);
//   const [selectedUserForChat, setSelectedUserForChat] = useState(null);

//   useEffect(() => {
//     // Fetch users only if the 'chat' tab is active and no specific user is selected for chat
//     if (activeTab === 'chat' && !selectedUserForChat) {
//       setLoadingUsers(true);
//       axios.get("http://localhost:8000/user")
//         .then(res => {
//           setUsers(res.data);
//           setLoadingUsers(false);
//         })
//         .catch(err => {
//           setUserError(err.message || "Failed to fetch users.");
//           setLoadingUsers(false);
//         });
//     } else if (activeTab !== 'chat') {
//       // If not on chat tab, reset loading/error states for users
//       setLoadingUsers(false); 
//       setUserError(null);
//     }
//   }, [activeTab, selectedUserForChat]); // Re-fetch or update based on tab and chat selection

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setSelectedUserForChat(null); // Reset chat selection when switching main tabs
//   };

//   // Content for the Chat List view (when no specific user is selected for chat)
//   const renderChatListContent = () => {
//     if (loadingUsers) return <div className="text-center py-10">Loading users...</div>;
//     if (userError) return <div className="text-center py-10 text-red-500">Error: {userError}</div>;
    
//     return (
//       <div className='max-w-3xl mx-auto'>
//         <header className="mb-8 text-center">
//           <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
//             Customer Chats
//           </h1>
//           <p className="mt-3 text-lg text-gray-600">
//             Browse, search, and click on a customer to start a chat.
//           </p>
//         </header>
//         <UserCard users={users} onUserClick={setSelectedUserForChat} />
//       </div>
//     );
//   };

//   // Content for the Dashboard view
//   const renderDashboardContent = () => {
//     return (
//       <div className='max-w-3xl mx-auto text-center'>
//         <header className="mb-8 text-center">
//           <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 sm:text-5xl">
//             Dashboard
//           </h1>
//           <p className="mt-3 text-lg text-gray-600">
//             Welcome to your dashboard overview.
//           </p>
//         </header>
//         {/* Placeholder for actual dashboard components */}
//         <p className="text-gray-700">Your dashboard components will appear here.</p>
//       </div>
//     );
//   };

//   return (
//     <div className='min-h-screen bg-gradient-to-br from-slate-100 to-sky-100'>
//       <Header activeTab={activeTab} onTabChange={handleTabChange} />
      
//       {/* Content Area: pt-16 (padding-top: 4rem or 64px) to offset fixed navbar's height (h-16) */}
//       <div className="pt-16"> 
//         {activeTab === 'chat' && (
//           selectedUserForChat ? (
//             <UserChat // UserChat component should handle its own layout/padding
//               user={selectedUserForChat}
//               onBackToList={() => setSelectedUserForChat(null)}
//               socket={socket}
//             />
//           ) : (
//             // Container for chat list view with its own padding
//             <div className="py-8 px-4 sm:px-6 lg:px-8"> 
//               {renderChatListContent()}
//             </div>
//           )
//         )}
//         {activeTab === 'dashboard' && (
//           // Container for dashboard view with its own padding
//           <div className="py-8 px-4 sm:px-6 lg:px-8">
//             {renderDashboardContent()}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserChatList;

// // import axios from 'axios';
// // import { useEffect, useState } from 'react';
// // import UserList from './UserList';
// // import UserDetail from './UserDetail';

// // function App() {
// //   const [users, setUsers] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [selectedUser, setSelectedUser] = useState(null);

// //   useEffect(() => {
// //     setLoading(true);
// //     setError(null);
// //     axios.get("http://localhost:8000/user")
// //       .then(res => {
// //         setUsers(res.data);
// //         setLoading(false);
// //       })
// //       .catch(err => {
// //         setError(err.message || "Failed to fetch users. Make sure the backend is running and CORS is configured.");
// //         setLoading(false);
// //       });
// //   }, []);

// //   if (loading) {
// //     return (
// //       <div className="flex justify-center items-center min-h-screen bg-gray-100">
// //         <div className="text-xl font-semibold text-gray-700">Loading Users...</div>
// //       </div>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
// //         <div className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</div>
// //         <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
// //         <p className="mt-4 text-sm text-gray-600">
// //           Please check if your backend server is running at <code className="bg-gray-200 p-1 rounded">http://localhost:8000</code>
// //           and that the <code className="bg-gray-200 p-1 rounded">/api/customers</code> endpoint is available.
// //         </p>
// //       </div>
// //     );
// //   }

// //   if (selectedUser) {
// //     return <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} />;
// //   }

// //   return (
// //     <UserList users={users} onUserClick={setSelectedUser} />
// //   );
// // }

// // export default App;

// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import UserList from './UserList';
// import UserChat from './UserChat'; // Import UserChat

// function App() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedUserForChat, setSelectedUserForChat] = useState(null); // Renamed for clarity

//   useEffect(() => {
//     setLoading(true);
//     setError(null);
//     axios.get("http://localhost:8000/user") // Ensure this endpoint is correct
//       .then(res => {
//         setUsers(res.data);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error("Error fetching users:", err);
//         setError(err.message || "Failed to fetch users. Make sure the backend is running and CORS is configured.");
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-100">
//         <div className="text-xl font-semibold text-gray-700">Loading Users...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
//         <div className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</div>
//         <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
//         <p className="mt-4 text-sm text-gray-600">
//           Please check if your backend server is running at <code className="bg-gray-200 p-1 rounded">http://localhost:8000</code>
//           and that the <code className="bg-gray-200 p-1 rounded">/api/customers</code> endpoint is available.
//         </p>
//       </div>
//     );
//   }

//   // If a user is selected for chat, show the UserChat component
//   if (selectedUserForChat) {
//     return <UserChat user={selectedUserForChat} onBackToList={() => setSelectedUserForChat(null)} />;
//   }

//   // Otherwise, show the UserList
//   return (
//     <UserList users={users} onUserClick={setSelectedUserForChat} />
//   );
// }

// export default App;