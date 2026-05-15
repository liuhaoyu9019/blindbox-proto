import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/draw/:seriesId',
      name: 'Draw',
      component: () => import('@/pages/DrawPage.vue'),
    },
    {
      path: '/result',
      name: 'Result',
      component: () => import('@/pages/ResultPage.vue'),
    },
    {
      path: '/collection',
      name: 'Collection',
      component: () => import('@/pages/CollectionPage.vue'),
    },
    {
      path: '/share',
      name: 'Share',
      component: () => import('@/pages/SharePage.vue'),
    },
  ],
})

export default router
