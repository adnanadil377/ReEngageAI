// usercard.jsx
import { useState, useMemo } from 'react';

const UserCard = ({ users, onUserClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user =>
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  return (
    <div>
        <div className="mb-8 px-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-3 sm:text-sm border-gray-300 rounded-xl shadow-sm"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'No Customers Match Your Search' : 'No Customers Found'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try a different search term.' : 'It seems there are no customers to display.'}
            </p>
          </div>
        )}
        <div className="space-y-4">
          {filteredUsers.map(user => (
            <div
              key={user.user_id || user.id}
              onClick={() => onUserClick(user)}
              className="bg-white shadow-lg rounded-xl p-5 hover:shadow-2xl transition-shadow duration-300 ease-in-out cursor-pointer border border-transparent hover:border-indigo-500"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white text-xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-indigo-700 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    WhatsApp: {user.phone || user.wa_id}
                    {user.email && <span className="ml-2">· Email: {user.email}</span>}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}

export default UserCard;