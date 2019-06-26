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
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
            @click="saveProxies"
          >Save</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
            @click="clearProxies"
          >Clear</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg raise"
            @click="$refs.proxyFile.click()"
          >Add</button>
          <input type="file" ref="proxyFile" class="invisible" @change="addProxies">
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
import axios from "axios";
import { ConcurrencyManager } from "axios-concurrency";
// @ is an alias to /src

export default {
  mounted() {
    let self = this;
    self.$socket.on("ProxyStatus", data => {
      console.log("ProxyStatus event is trigged on client.");

      if (typeof data === "string") console.log(data);
      else if (typeof data === "object") {
        self.proxyData[data.index].status = {
          code: data.code,
          message: data.message
        };
      }
    });
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
      var length = this.groupData.length;
      this.groupData.push({
        name: "Group" + (length + 1),
        status: {
          code: 3,
          message: this.proxyData.length
        }
      });
    },
    clearProxies() {
      this.proxyData.length = 0;
    },
    addProxies() {
      if (window.FileReader) {
        // FileReader are supported.
        var reader = new FileReader();
        // Read file into memory as UTF-8
        reader.readAsText(this.$refs.proxyFile.files[0]);
        // Handle errors load
        reader.onload = this.onLoadProxyFile;
        reader.onerror = function() {
          console.log("Error occured while reading proxy file");
        };
      } else {
        alert("FileReader are not supported in this browser.");
      }
    },
    async onLoadProxyFile(event) {
      var contents = event.target.result;
      var proxyList = contents.split(/\r\n|\r|\n/g);

      proxyList.map(item => {
        this.proxyData.push({
          proxy: item,
          status: {
            code: 2,
            message: "Ready"
          }
        });
      });

      let api = axios.create({
        baseURL: "http://localhost:5000"
      });

      // a concurrency parameter of 1 makes all api requests secuential
      const MAX_CONCURRENT_REQUESTS = 2;

      // init your manager.
      // eslint-disable-next-line no-unused-vars
      const manager = ConcurrencyManager(api, MAX_CONCURRENT_REQUESTS);

      // requests will be sent in batches determined by MAX_CONCURRENT_REQUESTS
      Promise.all(
        this.proxyData.map((item, index) => {
          var elements = item.proxy.split(":");
          if (elements.length !== 4) return;
          return api.post("/test-proxy", {
            proxy: {
              host: elements[0],
              port: elements[1],
              username: elements[2],
              password: elements[3]
            },
            tableIndex: index
          });
        })
      ).then(responses => {
        // ...
        console.log(responses);
      });

      // to stop using the concurrency manager.
      // will eject the request and response handlers from your instance
      // manager.detach();
    },
    saveGroup() {
      // let setting = this.$store.getters.accountSettings;
    },
    clearGroup() {
      this.groupData.length = 0;
    },
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

