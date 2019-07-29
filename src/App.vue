<template>
  <div id="app" style="-webkit-app-region: drag" class="font-sans flex min-h-screen">
    <menu-bar></menu-bar>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>

    <footer-bar></footer-bar>
  </div>
</template>

<script>
import MenuBar from "./components/MenuBar.vue";
import FooterBar from "./components/FooterBar.vue";
import "animate.css/animate.css";

export default {
  data() {
    return {
      isConnected: false,
      socketMessage: ""
    };
  },
  components: {
    MenuBar,
    FooterBar
  },
  sockets: {
    connect() {
      // Fired when the socket connects.
      this.isConnected = true;
    },

    disconnect() {
      this.isConnected = false;
    },

    // Fired when the server sends something on the "messageChannel" channel.
    generalChannel(data) {
      this.socketMessage = data;
      console.log("General event is trigged on App Main Client.");
      console.log(this.socketMessage);
    },

    // Logs received
    ApplicationLog(data) {
      console.log("catchted in App.vue", data);
    },

    CreateLog(data) {
      this.addLogHistory(
        typeof data === "string" ? data : data.message,
        "CreateLog",
        typeof data === "string" ? 0 : data.index + 1
      );
    },
    VerifyLog(data) {
      this.addLogHistory(
        typeof data === "string" ? data : data.message,
        "VerifyLog",
        typeof data === "string" ? 0 : data.index + 1
      );
    },
    ProxyStatus(data) {
      this.addLogHistory(
        typeof data === "string" ? data : data.message,
        "ProxyStatus",
        typeof data === "string" ? 0 : data.index + 1
      );
    }
  },

  methods: {
    addLogHistory(message, tag, index) {
      this.$store.commit("ADD_TO_APP_LOGS", {
        message: message,
        type: tag + (!index ? "" : " #" + index),
        time: new Date().toLocaleString()
      });
    }
  }
};
</script>

<style src="./assets/main.scss" lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
}
</style>
