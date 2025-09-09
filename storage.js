// storage.js
const STORAGE_KEY = 'clients';

export function loadClients() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    alert('本地数据损坏，已重置。');
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveClients(clients) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (e) {
    alert('保存失败，请检查存储空间。');
  }
} 