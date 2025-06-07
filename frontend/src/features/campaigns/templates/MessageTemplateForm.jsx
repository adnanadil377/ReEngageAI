import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { messageTemplateService } from '../../../services/campaignApiService';

function MessageTemplateForm() {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(templateId);

    const [formData, setFormData] = useState({
        name: '',
        content: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            messageTemplateService.getById(templateId)
                .then(template => {
                    setFormData({
                        name: template.name,
                        content: template.content || ''
                    });
                    setError('');
                })
                .catch(err => {
                    setError(err.message);
                })
                .finally(() => setLoading(false));
        } else {
            setFormData({ name: '', content: '' });
            setError('');
        }
    }, [templateId, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            name: formData.name,
            content: formData.content
        };

        try {
            if (isEditing) {
                await messageTemplateService.update(templateId, payload);
            } else {
                await messageTemplateService.create(payload);
            }
            navigate('/campaigns/templates');
        } catch (err) {
            setError(err.message || 'Failed to save message template.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Loading template details...</p>;

    return (
        <div>
            <h2>{isEditing ? 'Edit' : 'Create'} Message Template</h2>
            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '5px' }}>Error: {error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem' }}>Template Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="content" style={{ display: 'block', marginBottom: '0.25rem' }}>Template Content:</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows="10"
                        required
                        style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    />
                    <small style={{ display: 'block', marginTop: '0.25rem' }}>
                        You can use placeholders like <code style={{ background: '#f0f0f0', padding: '2px 5px', borderRadius: '3px' }}>{{name}}</code>, <code style={{ background: '#f0f0f0', padding: '2px 5px', borderRadius: '3px' }}>{{order_id}}</code>, etc.
                    </small>
                </div>
                <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Saving...' : 'Save Template'}
                </button>
                <button type="button" onClick={() => navigate('/campaigns/templates')} style={{ marginLeft: '1rem', padding: '0.75rem 1.5rem' }} disabled={loading}>
                    Cancel
                </button>
            </form>
        </div>
    );
}
export default MessageTemplateForm;
