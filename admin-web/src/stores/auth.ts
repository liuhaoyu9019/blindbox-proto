import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AdminInfo } from '../types';
import { authApi } from '../api';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'));
  const admin = ref<AdminInfo | null>(JSON.parse(localStorage.getItem('admin_info') || 'null'));

  const isLoggedIn = computed(() => !!token.value && !!admin.value);

  function saveAuth(t: string, a: AdminInfo) {
    token.value = t;
    admin.value = a;
    localStorage.setItem('admin_token', t);
    localStorage.setItem('admin_info', JSON.stringify(a));
  }

  function clearAuth() {
    token.value = null;
    admin.value = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  }

  async function login(username: string, password: string) {
    const res = await authApi.login(username, password);
    saveAuth(res.token, res.admin);
    return res;
  }

  function logout() {
    clearAuth();
  }

  return { token, admin, isLoggedIn, login, logout, clearAuth };
});
