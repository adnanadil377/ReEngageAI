import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userCategoryService } from '../../../services/campaignApiService';

function UserCategoryForm() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(categoryId);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        filter_criteria_json: '{}' // Stored as JSON string for textarea
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            userCategoryService.getById(categoryId)
                .then(cat => {
                    setFormData({
                        name: cat.name,
                        description: cat.description || '',
                        filter_criteria_json: JSON.stringify(cat.filter_criteria || {}, null, 2)
                    });
                    setError('');
                })
                .catch(err => {
                    setError(err.message);
                    // Optionally navigate back or show more prominent error if load fails
                    // navigate('/campaigns/categories');
                })
                .finally(() => setLoading(false));
        } else {
            // Reset form for 'new'
            setFormData({
                name: '',
                description: '',
                filter_criteria_json: '{}'
            });
            setError('');
        }
    }, [categoryId, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let parsedCriteria;
        try {
            parsedCriteria = JSON.parse(formData.filter_criteria_json);
        } catch (jsonError) {
            setError('Filter criteria is not valid JSON. Please correct it.');
            setLoading(false);
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            filter_criteria: parsedCriteria
        };

        try {
            if (isEditing) {
                await userCategoryService.update(categoryId, payload);
            } else {
                await userCategoryService.create(payload);
            }
            navigate('/campaigns/categories'); // Or wherever the list is
        } catch (err) {
            setError(err.message || 'Failed to save category.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Loading category details...</p>;

    return (
        <div>
            <h2>{isEditing ? 'Edit' : 'Create'} User Category</h2>
            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '5px' }}>Error: {error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem' }}>Name:</label>
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
                    <label htmlFor="description" style={{ display: 'block', marginBottom: '0.25rem' }}>Description:</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="filter_criteria_json" style={{ display: 'block', marginBottom: '0.25rem' }}>Filter Criteria (JSON):</label>
                    <textarea
                        id="filter_criteria_json"
                        name="filter_criteria_json"
                        value={formData.filter_criteria_json}
                        onChange={handleChange}
                        rows="10"
                        required
                        style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    />
                    <small style={{ display: 'block', marginTop: '0.25rem' }}>
                        Example: <pre style={{ background: '#f0f0f0', padding: '5px', borderRadius: '3px', display: 'inline-block' }}>{JSON.stringify({"signup_date_after": "2023-01-01", "purchase_min_value": 50}, null, 2)}</pre>
                    </small>
                </div>
                <button type="submit" disabled={loading} style={{ padding: '0.75rem 1.5rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Saving...' : 'Save Category'}
                </button>
                <button type="button" onClick={() => navigate('/campaigns/categories')} style={{ marginLeft: '1rem', padding: '0.75rem 1.5rem' }} disabled={loading}>
                    Cancel
                </button>
            </form>
        </div>
    );
}
export default UserCategoryForm;
