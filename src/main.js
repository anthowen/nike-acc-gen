import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import * as io from "socket.io-client";
import VueSocketIO from "vue-socket.io";
import VueLodash from "vue-lodash";

Vue.config.productionTip = false;
Vue.use(VueSocketIO, io("http://localhost:5000", { path: "/mypath" }), store);

const options = { name: "lodash" }; // customize the way you want to call it
Vue.use(VueLodash, options); // options is optional

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

// process.on("unhandledRejection", error => {
//   console.error(error);
// });
