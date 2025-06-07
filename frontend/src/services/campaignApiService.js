const API_BASE_URL = '/api'; // Adjust if your FastAPI prefix is different or use process.env.REACT_APP_API_URL

export const userCategoryService = {
    async getAll() {
        const response = await fetch(`${API_BASE_URL}/user-categories/`);
        if (!response.ok) throw new Error('Failed to fetch user categories');
        return response.json();
    },
    async getById(id) {
        const response = await fetch(`${API_BASE_URL}/user-categories/${id}`);
        if (!response.ok) throw new Error('Failed to fetch user category');
        return response.json();
    },
    async create(categoryData) {
        const response = await fetch(`${API_BASE_URL}/user-categories/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create user category');
        }
        return response.json();
    },
    async update(id, categoryData) {
        const response = await fetch(`${API_BASE_URL}/user-categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update user category');
        }
        return response.json();
    },
    async delete(id) {
        const response = await fetch(`${API_BASE_URL}/user-categories/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok && response.status !== 204) { // 204 No Content is a success
            // Try to parse error only if there's content, otherwise use generic message
            let errorDetail = 'Failed to delete user category';
            if (response.headers.get("content-type")?.includes("application/json")) {
                 const error = await response.json();
                 errorDetail = error.detail || errorDetail;
            }
            throw new Error(errorDetail);
        }
        return true; // Or response itself if needed (though 204 has no body)
    }
};

export const messageTemplateService = {
    async getAll() {
        const response = await fetch(`${API_BASE_URL}/message-templates/`);
        if (!response.ok) throw new Error('Failed to fetch message templates');
        return response.json();
    },
    async getById(id) {
        const response = await fetch(`${API_BASE_URL}/message-templates/${id}`);
        if (!response.ok) throw new Error('Failed to fetch message template');
        return response.json();
    },
    async create(templateData) {
        const response = await fetch(`${API_BASE_URL}/message-templates/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create message template');
        }
        return response.json();
    },
    async update(id, templateData) {
        const response = await fetch(`${API_BASE_URL}/message-templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update message template');
        }
        return response.json();
    },
    async delete(id) {
        const response = await fetch(`${API_BASE_URL}/message-templates/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok && response.status !== 204) { // 204 No Content is a success
            let errorDetail = 'Failed to delete message template';
            if (response.headers.get("content-type")?.includes("application/json")) {
                 const error = await response.json();
                 errorDetail = error.detail || errorDetail;
            }
            throw new Error(errorDetail);
        }
        return true;
    }
};

// Add similar service objects for campaigns, analytics later
