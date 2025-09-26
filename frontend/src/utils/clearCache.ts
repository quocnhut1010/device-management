// Utility để clear browser cache và storage
export const clearAllCache = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage  
  sessionStorage.clear();
  
  // Clear cookies (nếu có thể)
  if ('cookieStore' in window) {
    // Modern browsers
    try {
      (window as any).cookieStore.getAll().then((cookies: any[]) => {
        cookies.forEach(cookie => {
          (window as any).cookieStore.delete(cookie.name);
        });
      });
    } catch (e) {
      console.warn('Cannot clear cookies automatically');
    }
  }
  
  // Clear service worker cache (nếu có)
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  console.log('✅ All browser cache and storage cleared!');
  alert('Cache cleared! Please refresh the page.');
};

export const clearApiCache = () => {
  // Just clear relevant localStorage items
  const keysToKeep = ['token']; // Keep important items
  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ API cache cleared!');
};