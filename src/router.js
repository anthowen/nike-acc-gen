import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "settings",
      component: () =>
        import(/* webpackChunkName: "develop" */ "./views/Settings.vue")
    },
    {
      path: "/account-settings",
      name: "account-settings",
      component: () =>
        import(/* webpackChunkName: "create" */ "./views/AccountSettings.vue")
    },
    {
      path: "/account-log",
      name: "account-log",
      // route level code-splitting
      // this generates a separate chunk (create.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "create" */ "./views/AccountLog.vue")
    },
    {
      path: "/verify-log",
      name: "verify-log",
      component: () =>
        import(/* webpackChunkName: "work" */ "./views/VerifyLog.vue")
    },
    {
      path: "/proxies",
      name: "proxies",
      component: () =>
        import(/* webpackChunkName: "play" */ "./views/Proxies.vue")
    },
    {
      path: "/logs",
      name: "logs",
      component: () => import(/* webpackChunkName: "play" */ "./views/Logs.vue")
    }
    // {
    //   path: "/categories",
    //   name: "categories",
    //   component: () =>
    //     import(/* webpackChunkName: "categories" */ "./views/Categories.vue")
    // },
    // {
    //   path: "/updates",
    //   name: "updates",
    //   component: () =>
    //     import(/* webpackChunkName: "updates" */ "./views/Updates.vue")
    // },
    // {
    //   path: "/story",
    //   name: "story",
    //   props: true,
    //   component: () =>
    //     import(/* webpackChunkName: "story" */ "./views/Story.vue")
    // },
    // {
    //   path: "/product",
    //   name: "product",
    //   props: true,
    //   component: () =>
    //     import(/* webpackChunkName: "product" */ "./views/Product.vue")
    // }
  ]
});
