import axios from 'axios';

const api = {
  postROIEmail: async ({ body }) => {
    try {
      const response = await axios.post('/api/roi-email', body);
      return response.data;
    } catch (error) {
      console.error('Error sending ROI email:', error);
      throw error;
    }
  }
};

export default api; 