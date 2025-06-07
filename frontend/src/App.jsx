import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthorizeUser from './auth/AuthorizeUser';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './auth/LoginPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ProfilePage from "./pages/ProfilePage";

// Import campaign category components
import UserCategoryList from './features/campaigns/categories/UserCategoryList';
import UserCategoryForm from './features/campaigns/categories/UserCategoryForm';

// Import campaign template components
import MessageTemplateList from './features/campaigns/templates/MessageTemplateList';
import MessageTemplateForm from './features/campaigns/templates/MessageTemplateForm';

const App = () => {
  return (
    // <div>
    //   <UserChatList />
    // </div>
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path='/' element={<HomePage />}/>
          <Route path='/auth' element={<AuthorizeUser />}/>
          <Route path='/login' element={<LoginPage />}/>
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path='/Chat' element={<ChatPage />} />
            <Route path='/dashboard' element={<DashboardPage />} />

            {/* Campaign Management Routes */}
            {/* User Categories */}
            <Route path="/campaigns/categories" element={<UserCategoryList />} />
            <Route path="/campaigns/categories/new" element={<UserCategoryForm />} />
            <Route path="/campaigns/categories/edit/:categoryId" element={<UserCategoryForm />} />

            {/* Message Templates */}
            <Route path="/campaigns/templates" element={<MessageTemplateList />} />
            <Route path="/campaigns/templates/new" element={<MessageTemplateForm />} />
            <Route path="/campaigns/templates/edit/:templateId" element={<MessageTemplateForm />} />

            {/* Add other campaign routes here later */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App


// import axios from 'axios';
// import { useEffect, useState } from 'react';
// import UserChat from './UserChat';
// import socket from './socket'; // 🔥 import the socket instance
// import UserCard from './UserCard';

// function App() {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [selectedUserForChat, setSelectedUserForChat] = useState(null);

//   useEffect(() => {
//     axios.get("http://localhost:8000/user")
//       .then(res => {
//         setUsers(res.data);
//         setLoading(false);
//       })
//       .catch(err => {
//         setError(err.message || "Failed to fetch users.");
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return selectedUserForChat ? (
//     <UserChat
//       user={selectedUserForChat}
//       onBackToList={() => setSelectedUserForChat(null)}
//       socket={socket} // 🔥 pass socket
//     />
//   ) : (
//     <UserCard users={users} onUserClick={setSelectedUserForChat} />
//   );
// }

// export default App;


// // // import axios from 'axios';
// // // import { useEffect, useState } from 'react';
// // // import UserList from './UserList';
// // // import UserDetail from './UserDetail';

// // // function App() {
// // //   const [users, setUsers] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState(null);
// // //   const [selectedUser, setSelectedUser] = useState(null);

// // //   useEffect(() => {
// // //     setLoading(true);
// // //     setError(null);
// // //     axios.get("http://localhost:8000/user")
// // //       .then(res => {
// // //         setUsers(res.data);
// // //         setLoading(false);
// // //       })
// // //       .catch(err => {
// // //         setError(err.message || "Failed to fetch users. Make sure the backend is running and CORS is configured.");
// // //         setLoading(false);
// // //       });
// // //   }, []);

// // //   if (loading) {
// // //     return (
// // //       <div className="flex justify-center items-center min-h-screen bg-gray-100">
// // //         <div className="text-xl font-semibold text-gray-700">Loading Users...</div>
// // //       </div>
// // //     );
// // //   }

// // //   if (error) {
// // //     return (
// // //       <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
// // //         <div className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</div>
// // //         <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>
// // //         <p className="mt-4 text-sm text-gray-600">
// // //           Please check if your backend server is running at <code className="bg-gray-200 p-1 rounded">http://localhost:8000</code>
// // //           and that the <code className="bg-gray-200 p-1 rounded">/api/customers</code> endpoint is available.
// // //         </p>
// // //       </div>
// // //     );
// // //   }

// // //   if (selectedUser) {
// // //     return <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} />;
// // //   }

// // //   return (
// // //     <UserList users={users} onUserClick={setSelectedUser} />
// // //   );
// // // }

// // // export default App;

// // import axios from 'axios';
// // import { useEffect, useState } from 'react';
// // import UserList from './UserList';
// // import UserChat from './UserChat'; // Import UserChat

// // function App() {
// //   const [users, setUsers] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [selectedUserForChat, setSelectedUserForChat] = useState(null); // Renamed for clarity

// //   useEffect(() => {
// //     setLoading(true);
// //     setError(null);
// //     axios.get("http://localhost:8000/user") // Ensure this endpoint is correct
// //       .then(res => {
// //         setUsers(res.data);
// //         setLoading(false);
// //       })
// //       .catch(err => {
// //         console.error("Error fetching users:", err);
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

// //   // If a user is selected for chat, show the UserChat component
// //   if (selectedUserForChat) {
// //     return <UserChat user={selectedUserForChat} onBackToList={() => setSelectedUserForChat(null)} />;
// //   }

// //   // Otherwise, show the UserList
// //   return (
// //     <UserList users={users} onUserClick={setSelectedUserForChat} />
// //   );
// // }

// // export default App;