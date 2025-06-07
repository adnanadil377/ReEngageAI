import React, { useState, useEffect } from 'react';
import { messageTemplateService } from '../../../services/campaignApiService';
import { Link } from 'react-router-dom';

function MessageTemplateList() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        messageTemplateService.getAll()
            .then(data => {
                setTemplates(data);
                setError('');
            })
            .catch(err => {
                setError(err.message);
                setTemplates([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this message template?')) {
            try {
                await messageTemplateService.delete(id);
                setTemplates(templates.filter(t => t.id !== id));
                setError('');
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) return <p>Loading message templates...</p>;

    return (
        <div>
            <h2>Message Templates</h2>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <Link to="/campaigns/templates/new" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                Create New Template
            </Link>
            {templates.length === 0 && !loading && !error ? <p>No message templates found.</p> : (
                <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Content Preview</th>
                            <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templates.map(template => (
                            <tr key={template.id}>
                                <td style={{ padding: '8px' }}>{template.id}</td>
                                <td style={{ padding: '8px' }}>{template.name}</td>
                                <td style={{ padding: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {template.content.substring(0, 100)}{template.content.length > 100 ? '...' : ''}
                                </td>
                                <td style={{ padding: '8px' }}>
                                    <Link to={`/campaigns/templates/edit/${template.id}`} style={{ marginRight: '8px' }}>Edit</Link>
                                    <button onClick={() => handleDelete(template.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
export default MessageTemplateList;
