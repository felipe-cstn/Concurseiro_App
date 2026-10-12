export const NotificationService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const res = await Notification.requestPermission();
      return res === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission', e);
      return false;
    }
  },

  sendNotification(title: string, options?: NotificationOptions): void {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } catch (e) {
      console.warn('Could not display notification', e);
    }
  }
};
