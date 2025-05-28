import React from 'react'

const CreateTemplate = ({showCreateForm,setShowCreateForm,handleCreateTemplate, newTemplate, handleNewTemplateChange, isLoading}) => {
  return (
    <div>
        <div className="mb-8">
            <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow transition duration-150 ease-in-out"
            >
            {showCreateForm ? 'Cancel' : 'Add New Template'}
            </button>

            {showCreateForm && (
            <form onSubmit={handleCreateTemplate} className="mt-6 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Create New Template</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Template Name (Meta Registered)*</label>
                    <input type="text" name="name" id="name" value={newTemplate.name} onChange={handleNewTemplateChange} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" name="description" id="description" value={newTemplate.description} onChange={handleNewTemplateChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="language_code" className="block text-sm font-medium text-gray-700 mb-1">Language Code</label>
                    <input type="text" name="language_code" id="language_code" value={newTemplate.language_code} onChange={handleNewTemplateChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" id="category" value={newTemplate.category} onChange={handleNewTemplateChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm">
                    <option value="UTILITY">UTILITY</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="AUTHENTICATION">AUTHENTICATION</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Meta Status</label>
                    <input type="text" name="status" id="status" value={newTemplate.status} onChange={handleNewTemplateChange} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                </div>
                </div>
                <div className="mb-4">
                <label htmlFor="components_structure_str" className="block text-sm font-medium text-gray-700 mb-1">Components Structure (JSON)*</label>
                <textarea
                    name="components_structure_str"
                    id="components_structure_str"
                    rows="8"
                    value={newTemplate.components_structure_str}
                    onChange={handleNewTemplateChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm"
                    placeholder='Example: {"HEADER": {"format": "TEXT", "text": "Order {{1}}"}, "BODY": {"text": "Hi {{1}}, code: {{2}}"}}'
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">Must be valid JSON. Placeholders like.</p>
                </div>
                <div className="mb-4">
                <label htmlFor="is_active" className="flex items-center text-sm font-medium text-gray-700">
                    <input type="checkbox" name="is_active" id="is_active" checked={newTemplate.is_active} onChange={handleNewTemplateChange} className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    Active for sending
                </label>
                </div>
                <button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded shadow disabled:opacity-50 transition duration-150 ease-in-out">
                {isLoading ? 'Saving...' : 'Save Template'}
                </button>
            </form>
            )}
        </div>
    </div>
  )
}

export default CreateTemplate