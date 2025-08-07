import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create a new invite
export const createInvite = async (inviteData) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`${API_BASE_URL}/invites/create/`, inviteData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

// Get pending invites for current project
export const getPendingInvites = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.get(`${API_BASE_URL}/invites/pending/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

// Get invite details (public endpoint)
export const getInviteDetails = async (inviteId) => {
  const response = await axios.get(`${API_BASE_URL}/invites/${inviteId}/`);
  return response.data;
};

// Accept an invite
export const acceptInvite = async (inviteId) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`${API_BASE_URL}/invites/${inviteId}/accept/`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

// Cancel an invite
export const cancelInvite = async (inviteId) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.delete(`${API_BASE_URL}/invites/${inviteId}/cancel/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

// Resend invite email
export const resendInvite = async (inviteId) => {
  const token = localStorage.getItem('accessToken');
  const response = await axios.post(`${API_BASE_URL}/invites/${inviteId}/resend/`, {}, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};
