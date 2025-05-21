function getAuthHeader(extraHeaders = {}) {
    const session = wx.getStorageSync('session') || {};
    const token = session.token || '';
  
    return {
      ...extraHeaders,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  
  module.exports = getAuthHeader;