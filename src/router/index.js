import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ComboboxChips from '../views/ComboboxChips.vue'

// Routes with meta.title are listed on the home page directory, in this order.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/list-layout',
      name: 'list-layout',
      component: () => import('../views/ListLayoutView.vue'),
      meta: {
        title: 'List layout',
        description: 'v-list with title and subtitle side by side, stacked at high zoom',
      },
    },
    {
      path: '/multi-touch',
      name: 'multi-touch',
      component: () => import('../views/MultiTouch.vue'),
      meta: {
        title: 'Multi-touch',
        description: 'Large toggle buttons around the edge; active titles shown in the middle',
      },
    },
    {
      path: '/select-play',
      name: 'select-play',
      component: () => import('../views/SelectPlay.vue'),
      meta: {
        title: 'Select play',
        description: 'v-select whose items use item-props for title and subtitle',
      },
    },
    {
      path: '/charts',
      name: 'charts',
      component: () => import('../views/Charts.vue'),
      meta: {
        title: 'Charts',
        description: 'List of songs with the artist as each row’s subtitle',
      },
    },
    {
      path: '/header-footer',
      name: 'header-footer',
      component: () => import('../views/HeaderFooterLayout.vue'),
      meta: {
        title: 'Header/footer layout',
        description: 'Flex column: 75px header, 41px fixed footer, scrolling content between',
      },
    },
    {
      path: '/combobox-chips',
      name: 'combobox-chips',
      component: ComboboxChips,
      meta: {
        // Full-width page, so the code column has room beside the demo.
        wide: true,
        title: 'Combobox chips',
        description: 'v-combobox that turns entered values into chips on Enter, with a typing hint and a Picklist dialog',
      },
    },
    {
      path: '/menu-hover-cursor',
      name: 'menu-hover-cursor',
      component: () => import('../views/MenuHoverCursor.vue'),
      meta: {
        // Full-width page, so the code column has room beside the demo.
        wide: true,
        title: 'Menu hover at cursor',
        description: 'v-menu that opens on hover of a faux link, placed at the mouse pointer',
      },
    },
    {
      path: '/counter',
      name: 'counter',
      component: () => import('../views/CounterView.vue'),
      meta: {
        title: 'Counter',
        description: 'Vuetify card backed by a Pinia store',
      },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
