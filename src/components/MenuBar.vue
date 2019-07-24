<template>
  <div class="flex items-center bg-nike-darkest p-3 text-center fixed z-10 w-full">
    <img src="../assets/logo.svg" alt="logo" class="px-8" />
    <router-link
      to="/account-settings"
      class="flex-auto txt-center px-4 py-2 text-grey no-underline cursor-pointer"
    >
      <div class="text-white hover:text-nike-orange">Account Settings</div>
    </router-link>

    <router-link
      to="/account-log"
      class="flex-auto text-center px-4 py-2 text-grey no-underline cursor-pointer"
    >
      <div class="text-white hover:text-nike-orange">Account Log</div>
    </router-link>

    <router-link
      to="/verify-log"
      class="flex-auto text-center px-4 py-2 text-grey no-underline cursor-pointer"
    >
      <div class="text-white hover:text-nike-orange">Verify Log</div>
    </router-link>

    <router-link
      to="/proxies"
      class="flex-auto text-center px-4 py-2 text-grey no-underline cursor-pointer"
    >
      <div class="text-white hover:text-nike-orange">Proxies</div>
    </router-link>

    <router-link
      to="/logs"
      class="flex-auto text-center px-4 py-2 text-grey no-underline cursor-pointer"
    >
      <div class="text-white hover:text-nike-orange">Logs</div>
    </router-link>

    <router-link
      to="/"
      class="flex-auto text-center px-4 py-2 text-grey no-underline cursor-pointer"
    >
      <div class="text-white hover:text-nike-orange">Settings</div>
    </router-link>
  </div>
</template>
