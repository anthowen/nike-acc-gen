import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as io from "socket.io-client";
import VueSocketIO from "vue-socket.io";

Vue.config.productionTip = false;
Vue.use(VueSocketIO, io("http://localhost:5000", { path: "/mypath" }), store);


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
