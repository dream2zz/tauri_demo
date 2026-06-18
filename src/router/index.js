import { createRouter, createWebHashHistory } from "vue-router";
import AppLayout from "../components/AppLayout.vue";

const routes = [
  {
    path: "/",
    name: "MainLayout",
    component: AppLayout,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;