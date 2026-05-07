const getToken = () => localStorage.getItem('gcp_token');

const request = async (url, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
};

export const getSnippets = async (userId, projectId = null) => {
  const url = projectId ? `/api/snippets?projectId=${projectId}` : '/api/snippets';
  return request(url);
};

export const getSnippet = async (id) => {
  // Not directly supported, we can just fetch all or filter locally, wait we can just implement fetching one if needed
  // For now let's just return from getSnippets
  const snippets = await getSnippets();
  return snippets.find(s => s.id === id) || null;
};

export const addSnippet = async (data) => {
  const res = await request('/api/snippets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.id;
};

export const updateSnippet = async (id, data) => {
  await request(`/api/snippets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteSnippet = async (id) => {
  await request(`/api/snippets/${id}`, {
    method: 'DELETE',
  });
};

export const getProjects = async (userId) => {
  return request('/api/projects');
};

export const getProject = async (id) => {
  const projects = await getProjects();
  return projects.find(p => p.id === id) || null;
};

export const addProject = async (data) => {
  const res = await request('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.id;
};

export const updateProject = async (id, data) => {
  await request(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteProject = async (id) => {
  await request(`/api/projects/${id}`, {
    method: 'DELETE',
  });
};

export const getSnippetCountByProject = async (userId, projectId) => {
  const res = await request(`/api/projects/${projectId}/count`);
  return res.count;
};

export const deleteAllUserData = async (userId) => {
  await request(`/api/users/${userId}`, {
    method: 'DELETE',
  });
};

export const exportDBFile = async () => {
  alert('Exporting DB is not supported in cloud version');
};

export const importDBFile = async (file) => {
  alert('Importing DB is not supported in cloud version');
};
