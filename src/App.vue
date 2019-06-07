<template>
  <div id="app" style="-webkit-app-region: drag" class="font-sans flex min-h-screen">
    <menu-bar></menu-bar>
    <transition name="fade" mode="out-in">
      <router-view/>
    </transition>

    <footer-bar></footer-bar>
  </div>
</template>

<script>
import MenuBar from "./components/MenuBar.vue";
import FooterBar from "./components/FooterBar.vue";
import "animate.css/animate.css";

export default {
  components: {
    MenuBar,
    FooterBar
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
