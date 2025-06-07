import React, { useState, useEffect } from 'react';
import { userCategoryService } from '../../../services/campaignApiService';
import { Link } from 'react-router-dom'; // Assuming React Router is used

function UserCategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        userCategoryService.getAll()
            .then(data => {
                setCategories(data);
                setError(''); // Clear previous errors
            })
            .catch(err => {
                setError(err.message);
                setCategories([]); // Clear categories on error
            })
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await userCategoryService.delete(id);
                setCategories(categories.filter(c => c.id !== id));
                setError(''); // Clear previous errors
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) return <p>Loading categories...</p>;
    // Error display will be below the title and create link

    return (
        <div>
            <h2>User Categories</h2>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <Link to="/campaigns/categories/new" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                Create New Category
            </Link>
            {categories.length === 0 && !loading && !error ? <p>No categories found.</p> : (
                <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{textAlign: 'left', padding: '8px'}}>ID</th>
                            <th style={{textAlign: 'left', padding: '8px'}}>Name</th>
                            <th style={{textAlign: 'left', padding: '8px'}}>Description</th>
                            <th style={{textAlign: 'left', padding: '8px'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td style={{padding: '8px'}}>{cat.id}</td>
                                <td style={{padding: '8px'}}>{cat.name}</td>
                                <td style={{padding: '8px'}}>{cat.description || 'N/A'}</td>
                                <td style={{padding: '8px'}}>
                                    <Link to={`/campaigns/categories/edit/${cat.id}`} style={{ marginRight: '8px' }}>Edit</Link>
                                    <button onClick={() => handleDelete(cat.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
export default UserCategoryList;
