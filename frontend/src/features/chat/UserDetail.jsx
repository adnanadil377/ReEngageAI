// function UserDetail({ user, onBack }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-2xl mx-auto">
//         <button
//           onClick={onBack}
//           className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
//           </svg>
//           Back to User List
//         </button>
//         <div className="bg-white shadow-xl rounded-lg overflow-hidden">
//           <div className="bg-indigo-500 p-6 sm:p-8">
//             <h2 className="text-3xl font-bold text-white">{user.name}</h2>
//             <p className="text-indigo-200 mt-1">WhatsApp ID: {user.phone || user.wa_id}</p>
//           </div>
//           <div className="border-t border-gray-200 px-6 py-5 sm:p-8">
//             <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Email</dt>
//                 <dd className="mt-1 text-sm text-gray-900">{user.email || 'N/A'}</dd>
//               </div>
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Total Orders</dt>
//                 <dd className="mt-1 text-sm text-gray-900">{user.total_orders !== undefined ? user.total_orders : 'N/A'}</dd>
//               </div>
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Last Purchase Date</dt>
//                 <dd className="mt-1 text-sm text-gray-900">{user.last_purchase_date ? new Date(user.last_purchase_date).toLocaleDateString() : 'N/A'}</dd>
//               </div>
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">First Purchase Date</dt>
//                 <dd className="mt-1 text-sm text-gray-900">{user.first_purchase_date ? new Date(user.first_purchase_date).toLocaleDateString() : 'N/A'}</dd>
//               </div>
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Total Spent</dt>
//                 <dd className="mt-1 text-sm text-gray-900">${user.total_spent !== undefined ? user.total_spent.toFixed(2) : 'N/A'}</dd>
//               </div>
//               <div className="sm:col-span-1">
//                 <dt className="text-sm font-medium text-gray-500">Marketing Consent</dt>
//                 <dd className={`mt-1 text-sm font-semibold ${user.marketing_consent ? 'text-green-600' : 'text-red-600'}`}>
//                   {user.marketing_consent ? 'Subscribed' : 'Unsubscribed'}
//                 </dd>
//               </div>
//               <div className="sm:col-span-2">
//                 <dt className="text-sm font-medium text-gray-500">Tags</dt>
//                 <dd className="mt-1 text-sm text-gray-900">
//                   {user.tags && user.tags.length > 0
//                     ? user.tags.map(tag => (
//                         <span key={tag} className="mr-2 mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                           {tag}
//                         </span>
//                       ))
//                     : 'No tags'}
//                 </dd>
//               </div>
//             </dl>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UserDetail;
// UserDetail.jsx
const UserDetail = ({ user, onBack, onBackToChat }) => { // Added onBackToChat
  const handleBack = onBackToChat || onBack; // Prioritize onBackToChat if provided
  const backButtonText = onBackToChat ? "Back to Chat" : "Back to User List";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {handleBack && ( // Only show button if a back handler is provided
          <button
            onClick={handleBack}
            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            {backButtonText}
          </button>
        )}
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-indigo-500 p-6 sm:p-8">
            <h2 className="text-3xl font-bold text-white">{user.name}</h2>
            <p className="text-indigo-200 mt-1">WhatsApp ID: {user.phone || user.wa_id}</p>
          </div>
          <div className="border-t border-gray-200 px-6 py-5 sm:p-8">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {/* ... (all your existing dl list items for user details) ... */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.email || 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total Orders</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.total_orders !== undefined ? user.total_orders : 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Last Purchase Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.last_purchase_date ? new Date(user.last_purchase_date).toLocaleDateString() : 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">First Purchase Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{user.first_purchase_date ? new Date(user.first_purchase_date).toLocaleDateString() : 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total Spent</dt>
                <dd className="mt-1 text-sm text-gray-900">${user.total_spent !== undefined ? user.total_spent.toFixed(2) : 'N/A'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Marketing Consent</dt>
                <dd className={`mt-1 text-sm font-semibold ${user.marketing_consent ? 'text-green-600' : 'text-red-600'}`}>
                  {user.marketing_consent ? 'Subscribed' : 'Unsubscribed'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Tags</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user.tags && user.tags.length > 0
                    ? user.tags.map(tag => (
                        <span key={tag} className="mr-2 mb-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {tag}
                        </span>
                      ))
                    : 'No tags'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;