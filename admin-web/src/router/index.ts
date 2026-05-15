import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AdminLayout from '../layouts/AdminLayout.vue';

const router = createRouter({
  history: createWebHistory('/admin/'),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../pages/LoginPage.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../pages/DashboardPage.vue'),
        },
        {
          path: 'series',
          name: 'Series',
          component: () => import('../pages/SeriesPage.vue'),
        },
        {
          path: 'series/:id/items',
          name: 'Items',
          component: () => import('../pages/ItemsPage.vue'),
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('../pages/UsersPage.vue'),
        },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  // Skip auth check if store isn't ready yet on first load
  const authStore = useAuthStore();
  if (to.meta.requiresAuth !== false && !authStore.isLoggedIn) {
    next('/login');
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
