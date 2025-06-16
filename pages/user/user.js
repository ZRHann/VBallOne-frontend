const getAuthHeader = require("../../utils/getAuthHeader");
Page({
    data: {
      isLoggedIn: false,
      username: '',
      role: '',
      avatarUrl: '',
      joinDate: '',
      showGuestTips: false
    },
  
    // 页面初次加载
    onLoad() {
      this.checkLoginStatus(); // 初次加载时就判断登录
    },
  
    // 每次页面显示时（比如 navigateBack 回来）
    onShow() {
        this.checkLoginStatus();
    },
  
    // 检查登录状态
    checkLoginStatus() {
        const session = wx.getStorageSync('session');
        const token = session?.token;
        if (!token) {
            // 没有 token，直接设置为未登录
            this.setData({
                isLoggedIn: false,
                username: '',
                role: '',
                avatarUrl: '',
                joinDate: '',
                showGuestTips: true
            });
            return;
        }

        // 有 token，请求后端验证
        wx.request({
            url: 'https://vballone.zrhan.top/api/users/me',
            method: 'GET',
            header: getAuthHeader(), 
            success: (res) => {
                let data = res.data;
                if (data.success && data.user) {
                    const joinDate = this.formatDate(data.user.createdAt);
                    this.setData({
                        isLoggedIn: true,
                        username: data.user.username,
                        role: session.role || '',        // role/头像仍需从缓存拿
                        avatarUrl: session.avatarUrl || '',
                        joinDate,
                        showGuestTips: false
                    });
                } else {
                    return;
                }
            },
            fail: (res) => {
                return;
            }
        });
    },

    /**
     * 格式化 ISO 时间为 YYYY-MM-DD
     */
    formatDate(isoStr) {
        if (!isoStr) return '';
        const date = new Date(isoStr);
        if (isNaN(date.getTime())) return '';
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    // 跳转登录页
    navigateToLogin() {
        wx.navigateTo({
        url: '/pages/login/login'
        });
    },
  
    // 退出登录
    handleLogout() {
        wx.showModal({
        title: '确认退出',
        content: '确定要退出当前账号吗？',
        success: (res) => {
            if (res.confirm) {
            wx.removeStorageSync('session');
            wx.removeStorageSync('scoreBoardData')
            this.checkLoginStatus();
            wx.showToast({ title: '已退出登录', icon: 'success' });
            }
        }
        });
    }
});
  