<template>
  <div class="bg-nike-dark text-white p-24 px-16 w-full mt-4 route-view-container">
    <h3 class="text-white">Proxies Directory</h3>
    <p
      class="text-grey header-description"
    >These proxies will be used when creating your Nike accounts</p>

    <div class="flex">
      <div class="flex-1 mx-4 proxy-list">
        <log-table class="mt-5" :tConfig="proxyTableConfig" :tData="proxyData" :tHeight="85"></log-table>

        <div class="button-group flex justify-between">
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg"
            @click="saveProxies"
          >Save</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
            @click="clearProxies"
          >Clear</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg"
            @click="AddProxies"
          >Add</button>
        </div>
      </div>
      <div class="flex-1 mx-4 proxy-group-list">
        <log-table class="mt-5" :tConfig="groupTableConfig" :tData="groupData" :tHeight="50"></log-table>

        <div class="button-group flex justify-between">
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg"
            @click="saveGroup"
          >Save</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
            @click="clearGroup"
          >Clear</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg"
            @click="newGroup"
          >New</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LogTable from "../components/LogTable.vue";
// @ is an alias to /src

export default {
  mounted() {
    for (let i = 0; i < 18; i++) {
      this.proxyData.push({
        proxy: "192.168.30.23:23354:omega:accounts",
        status: {
          code: i % 2 ? 6 : 3,
          message: i % 2 ? "Good" : "Bad"
        }
      });
    }
    for (let i = 0; i < 14; i++) {
      this.groupData.push({
        name: "Group" + (i + 1),
        status: {
          code: i % 2 ? 6 : 3,
          message: Math.floor(Math.random() * 99)
        }
      });
    }
  },
  components: {
    LogTable
  },
  data() {
    return {
      proxyTableConfig: [
        { prop: "_index", name: "ID" },
        { prop: "proxy", name: "Proxy" },
        { prop: "status", name: "Status" }
      ],
      groupTableConfig: [
        { prop: "_index", name: "ID" },
        { prop: "name", name: "Group Name" },
        { prop: "status", name: "Proxies" }
      ],
      proxyData: [],
      groupData: []
    };
  },
  methods: {
    getRandomString(len) {
      return [...Array(len)]
        .map(() => (~~(Math.random() * 36)).toString(36))
        .join("");
    },

    saveProxies() {
      // let setting = this.$store.getters.accountSettings;
    },
    clearProxies() {},
    AddProxies() {},
    saveGroup() {
      // let setting = this.$store.getters.accountSettings;
    },
    clearGroup() {},
    newGroup() {}
  }
};
</script>

<style lang="scss">
.proxy-list {
  position: relative;
  height: 76vh;
}
.proxy-group-list {
  position: relative;
  height: 76vh;
}
</style>

