import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import CreateTemplate from '../template/CreateTemplate';

// Base URL for your FastAPI backend
const API_BASE_URL = 'http://localhost:8000';

function Dashboard() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- State for Create Template Form ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    language_code: 'en_US',
    category: 'UTILITY',
    status: 'PENDING_APPROVAL',
    components_structure_str: '{}', // Store as string for textarea, parse on submit
    is_active: true,
  });

  // --- State for Send Template Modal/Form ---
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedTemplateForSend, setSelectedTemplateForSend] = useState(null);
  const [sendParams, setSendParams] = useState({
    recipient_phone_number: '',
    // Parameters will be built dynamically based on selectedTemplateForSend.components_structure
    // Example: body_params: [{type: 'text', text: ''}, ...], header_params: [...]
    components_parameters: {},
  });
  const [dynamicSendFormFields, setDynamicSendFormFields] = useState([]);


  // ------------------------ API Call Functions ------------------------

  const fetchTemplates = useCallback(async (isActive = null) => {
    setIsLoading(true);
    setError(null);

    let url = `${API_BASE_URL}/whatsapp-templates/`;
    if (isActive !== null) {
      url += `?is_active=${isActive}`;
    }

    try {
      const response = await axios.get(url);
      setTemplates(response.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        `Failed to fetch templates: ${err.response?.status || err.message}`;
      setError(errorMsg);
      console.error("Fetch templates error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    let components_structure;
    try {
      components_structure = JSON.parse(newTemplate.components_structure_str);
    } catch (jsonError) {
      setError("Invalid JSON in Components Structure. Please check the format.");
      setIsLoading(false);
      return;
    }

    const payload = {
      ...newTemplate,
      components_structure,
    };
    delete payload.components_structure_str; // Remove the string version

    try {
      const response = await axios.post(
        `${API_BASE_URL}/whatsapp-templates/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Use response.data if needed
      setShowCreateForm(false);
      setNewTemplate({
        name: '',
        description: '',
        language_code: 'en_US',
        category: 'UTILITY',
        status: 'PENDING_APPROVAL',
        components_structure_str: '{}',
        is_active: true,
      });

      fetchTemplates(); // Refresh the list
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        `Failed to create template: ${err.response?.status || err.message}`;
      setError(errorMsg);
      console.error("Create template error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTemplate = async (e) => {
    e.preventDefault();
    if (!selectedTemplateForSend) return;
    setIsLoading(true);
    setError(null);

    // Construct the final components_parameters for the API
    // This needs to be adapted based on how your `components_parameters` are structured in `sendParams`
    // and how your backend `/send-message` endpoint (not shown here, but assumed) expects them.
    // This is a simplified example assuming body/header/button params are directly in sendParams.components_parameters
    const payload = {
      recipient_phone_number: sendParams.recipient_phone_number,
      template_name: selectedTemplateForSend.name,
      language_code: selectedTemplateForSend.language_code, // Or allow override
      components_parameters: sendParams.components_parameters,
    };

    // NOTE: You need a /send-message endpoint in your FastAPI app (from previous examples)
    // For this example, I'll assume it's at /send-message
    // and it takes `components_parameters` like:
    // { "BODY": [{"type": "text", "text": "value1"}], "HEADER": [{"type": "image", "image": {"link": "url"}}]}
    const token = localStorage.getItem('authToken');
    
    try {
      // const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_BASE_URL}/send-message`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const responseData = response.data;
      alert(`Message sent successfully! Message ID: ${responseData.message_id || 'N/A'}`);
      setShowSendModal(false);
      setSendParams({ recipient_phone_number: '', components_parameters: {} });

    } catch (err) {
      const errorMsg =
        err.response?.data?.detail?.error ||
        err.response?.data?.detail ||
        `Failed to send template: ${err.response?.status || err.message}`;
      setError(errorMsg);
      alert(`Error sending message: ${errorMsg}`);
      console.error("Send template error:", err);
    } finally {
      setIsLoading(false);
    }
  };


  // ------------------------ Effects and UI Logic ------------------------

  useEffect(() => {
    fetchTemplates(true); // Fetch active templates on mount
  }, [fetchTemplates]);

  const handleNewTemplateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTemplate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSendParamsChange = (e) => {
    const { name, value } = e.target;
    setSendParams(prev => ({ ...prev, [name]: value }));
  };

  // Dynamically update component parameters for sending
  const handleDynamicParamChange = (componentType, index, value) => {
    setSendParams(prev => {
        const updatedComponents = { ...prev.components_parameters };
        if (!updatedComponents[componentType]) {
            updatedComponents[componentType] = [];
        }
        // Ensure the array is long enough
        while (updatedComponents[componentType].length <= index) {
            updatedComponents[componentType].push({ type: 'text', text: '' }); // Default to text
        }
        updatedComponents[componentType][index] = { type: 'text', text: value }; // Assuming all params are text for simplicity
        return { ...prev, components_parameters: updatedComponents };
    });
  };


  // Logic to parse template structure and generate form fields for sending
  const openSendModal = (template) => {
    setSelectedTemplateForSend(template);
    const fields = [];
    const initialParams = {};

    if (template.components_structure) {
      // HEADER parameters
      if (template.components_structure.HEADER && template.components_structure.HEADER.text) {
        const headerPlaceholders = (template.components_structure.HEADER.text.match(/{{[0-9]+}}/g) || []).length;
        if (headerPlaceholders > 0) {
            initialParams.HEADER = Array(headerPlaceholders).fill({ type: 'text', text: '' });
            for (let i = 0; i < headerPlaceholders; i++) {
                fields.push({
                    label: `Header Param {{${i + 1}}} (${template.components_structure.HEADER.example_text?.[i] || 'e.g., Name'})`,
                    componentType: 'HEADER',
                    index: i
                });
            }
        }
         // Handle HEADER image/document/video (if applicable) - more complex
        if (template.components_structure.HEADER.format && template.components_structure.HEADER.format !== 'TEXT') {
           fields.push({
             label: `Header ${template.components_structure.HEADER.format} URL`,
             componentType: 'HEADER',
             index: 0, // Assuming one media item
             mediaType: template.components_structure.HEADER.format.toLowerCase() // 'image', 'document', 'video'
           });
           initialParams.HEADER = [{ type: template.components_structure.HEADER.format.toLowerCase(), [template.components_structure.HEADER.format.toLowerCase()]: {link: ''}  }];
        }
      }

      // BODY parameters
      if (template.components_structure.BODY && template.components_structure.BODY.text) {
        const bodyPlaceholders = (template.components_structure.BODY.text.match(/{{[0-9]+}}/g) || []).length;
        if (bodyPlaceholders > 0) {
            initialParams.BODY = Array(bodyPlaceholders).fill({ type: 'text', text: '' });
            for (let i = 0; i < bodyPlaceholders; i++) {
                fields.push({
                    label: `Body Param {{${i + 1}}} (${template.components_structure.BODY.example_text?.[i] || `Value ${i+1}`})`,
                    componentType: 'BODY',
                    index: i
                });
            }
        }
      }
      // BUTTON parameters (for dynamic URL parts)
      if (template.components_structure.BUTTONS) {
        initialParams.BUTTONS = [];
        template.components_structure.BUTTONS.forEach((button, buttonIndex) => {
            if (button.type === 'URL' && button.url && button.url.includes("{{1}}")) { // Simplified: assumes only one {{1}} per button URL
                const buttonPlaceholders = (button.url.match(/{{[0-9]+}}/g) || []).length;
                if (buttonPlaceholders > 0) {
                    // API expects: { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: "value" }] }
                    const buttonParamEntry = {
                        type: "button",
                        sub_type: "url",
                        index: String(buttonIndex), // API expects string index for buttons
                        parameters: Array(buttonPlaceholders).fill({type: "text", text: ""})
                    };
                    initialParams.BUTTONS.push(buttonParamEntry);

                    for (let i = 0; i < buttonPlaceholders; i++) {
                        fields.push({
                            label: `Button ${buttonIndex + 1} URL Param {{${i + 1}}} (${button.example_url_suffix?.[i] || 'e.g., dynamic_path'})`,
                            componentType: 'BUTTONS',
                            buttonIndex: buttonIndex, // Keep track of which button component
                            paramIndex: i // Keep track of which parameter within that button component
                        });
                    }
                }
            }
        });
      }
    }
    setDynamicSendFormFields(fields);
    setSendParams(prev => ({ ...prev, recipient_phone_number: '', components_parameters: initialParams }));
    setShowSendModal(true);
  };

  // Specific handler for button param changes due to nested structure
  const handleButtonParamChange = (buttonIndex, paramIndex, value) => {
    setSendParams(prev => {
        const updatedComponents = { ...prev.components_parameters };
        if (!updatedComponents.BUTTONS || !updatedComponents.BUTTONS[buttonIndex] || !updatedComponents.BUTTONS[buttonIndex].parameters) {
            // This should ideally not happen if initialParams.BUTTONS is set up correctly
            console.error("Button parameters not initialized correctly");
            return prev;
        }
        updatedComponents.BUTTONS[buttonIndex].parameters[paramIndex] = { type: 'text', text: value };
        return { ...prev, components_parameters: updatedComponents };
    });
  };


  // ------------------------ JSX Rendering ------------------------
  if (isLoading && !templates.length && !showCreateForm && !showSendModal) { // Initial load
    return <div className="p-6 text-center">Loading templates...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">WhatsApp Templates Dashboard</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded">{error}</div>}

      {/* --- Create Template Section --- */}
      <CreateTemplate 
          showCreateForm={showCreateForm}
          setShowCreateForm={setShowCreateForm}
          handleCreateTemplate={handleCreateTemplate}
          newTemplate={newTemplate} 
          handleNewTemplateChange={handleNewTemplateChange} 
          isLoading={isLoading}
      />
      {/* --- View Templates Section --- */}
      <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-700">Available Templates</h2>
            <button
                onClick={() => fetchTemplates(true)}
                disabled={isLoading}
                className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded disabled:opacity-50"
            >
                {isLoading ? 'Refreshing...' : 'Refresh List'}
            </button>
        </div>
        {templates.length === 0 && !isLoading && (
          <p className="p-6 text-gray-600">No templates found. Add one to get started!</p>
        )}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status (Meta)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active (System)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description || 'No description'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.language_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        template.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        template.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        template.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {template.status}
                    </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {template.is_active ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-600">No</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                        onClick={() => openSendModal(template)}
                        disabled={!template.is_active || template.status !== 'APPROVED'}
                        className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold"
                        title={!template.is_active || template.status !== 'APPROVED' ? "Template must be active and approved by Meta to send" : "Send this template"}
                    >
                        Send
                    </button>
                    {/* Add Edit/Delete buttons here if needed, calling respective API endpoints */}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* --- Send Template Modal --- */}
      {showSendModal && selectedTemplateForSend && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative mx-auto p-5 border w-full max-w-lg md:max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Send Template: {selectedTemplateForSend.name}
              </h3>
              <form onSubmit={handleSendTemplate} className="mt-2 px-7 py-3 text-left">
                <div className="mb-4">
                  <label htmlFor="recipient_phone_number" className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone (e.g., 15551234567)*</label>
                  <input
                    type="tel"
                    name="recipient_phone_number"
                    id="recipient_phone_number"
                    value={sendParams.recipient_phone_number}
                    onChange={handleSendParamsChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>

                {dynamicSendFormFields.map((field, idx) => (
                  <div key={idx} className="mb-3">
                    <label htmlFor={`param-${field.componentType}-${field.index || field.buttonIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      id={`param-${field.componentType}-${field.index || field.buttonIndex}`}
                      value={
                        field.componentType === 'BUTTONS' ?
                        (sendParams.components_parameters.BUTTONS?.[field.buttonIndex]?.parameters?.[field.paramIndex]?.text || '') :
                        (sendParams.components_parameters[field.componentType]?.[field.index]?.text || (sendParams.components_parameters[field.componentType]?.[field.index]?.[field.mediaType]?.link || ''))
                      }
                      onChange={(e) => {
                        if (field.componentType === 'BUTTONS') {
                            handleButtonParamChange(field.buttonIndex, field.paramIndex, e.target.value);
                        } else if (field.mediaType) { // For header media links
                            setSendParams(prev => {
                                const updatedComponents = { ...prev.components_parameters };
                                if(!updatedComponents[field.componentType]) updatedComponents[field.componentType] = [];
                                updatedComponents[field.componentType][field.index] = {
                                    type: field.mediaType,
                                    [field.mediaType]: { link: e.target.value }
                                };
                                return { ...prev, components_parameters: updatedComponents };
                            });
                        }
                        else {
                            handleDynamicParamChange(field.componentType, field.index, e.target.value);
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                ))}

                <div className="items-center px-4 py-3 space-x-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                        setShowSendModal(false);
                        setSelectedTemplateForSend(null);
                        setDynamicSendFormFields([]);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;