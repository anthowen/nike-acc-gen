<template>
  <div class="bg-nike-dark text-white p-24 px-16 w-full mt-4 route-view-container">
    <h3 class="text-white">Proxies Directory</h3>
    <p
      class="text-grey header-description"
    >These proxies will be used when creating your Nike accounts</p>

    <div class="flex">
      <div class="flex-1 mx-4 proxy-list">
        <log-table
          class="mt-5"
          :tConfig="proxyTableConfig"
          :tData="proxyData"
          :tHeight="85"
          :key="proxyTableKey"
        ></log-table>

        <!-- Modal dialgo part for showing Save Proxy Group Name dialog -->
        <nike-modal :show="showGroupNameDlg" @close="showGroupNameDlg=false">
          <div class="modal-header">
            <h3>Save proxies into a new group</h3>
            <span class="text-nike-red mt-1">{{groupNameError}}</span>
          </div>
          <div class="modal-body">
            <label class="form-label">
              Group Name
              <input type="text" v-model="newProxyGroupName" class="form-control" />
            </label>
          </div>
          <div class="modal-footer text-right">
            <button
              class="px-4 py-2 modal-default-button order-solid border-2 border-green-darker text-grey text-lg rounded-lg slide"
              @click="saveProxiesIntoGroup()"
            >Save</button>
          </div>
        </nike-modal>

        <div class="button-group flex justify-between">
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
            @click="showGroupNameDlg=true"
          >Save</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
            @click="clearProxies"
          >Clear</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg raise"
            @click="$refs.proxyFile.click()"
          >Add</button>
          <input type="file" ref="proxyFile" class="invisible" @change="addProxies" />
        </div>
      </div>
      <div class="flex-1 mx-4 proxy-group-list">
        <log-table
          class="mt-5"
          :tConfig="groupTableConfig"
          :tData="groupTableData"
          :tHeight="50"
          :key="proxyGroupTableKey"
        ></log-table>

        <div class="button-group flex justify-between">
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
            @click="saveGroup"
          >Save</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
            @click="clearGroup"
          >Clear</button>
          <button
            class="mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg raise"
            @click="newGroup"
          >New</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LogTable from "../components/LogTable.vue";
import NikeModal from "../components/NikeModal.vue";
import axios from "axios";
import { ConcurrencyManager } from "axios-concurrency";
// @ is an alias to /src

export default {
  components: {
    LogTable,
    NikeModal
  },
  mounted() {
    this.$nextTick(function() {
      this.proxyData = this.$store.getters.proxyList;
      this.groupData = this.$store.getters.proxyGroupList;
      this.setGroupTableData();
      console.log("Proxies page : After did mount");
    });
  },
  computed: {},
  sockets: {
    ProxyStatus(data) {
      let self = this;
      console.log("ProxyStatus event is trigged on client.");

      if (typeof data === "string") console.log(data);
      else if (typeof data === "object") {
        self.proxyData[data.index].status = {
          code: data.code,
          message: data.message
        };
      }
    }
  },
  data() {
    return {
      proxyTableKey: 0,
      proxyGroupTableKey: 0,
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
      proxyData: this.$store.getters.proxyList,
      groupData: this.$store.getters.proxyGroupList,
      groupTableData: [],

      // Save Proxy Group Name Dialog
      showGroupNameDlg: false,
      newProxyGroupName: "",
      groupNameError: ""
    };
  },
  methods: {
    setGroupTableData() {
      console.log("groupTableData computed");
      this.groupTableData = [];
      for (let key in this.groupData) {
        this.groupTableData.push({
          name: key,
          status: this.groupData[key].status
        });
      }

      this.forceRerenderProxyGroupTable();
    },
    forceRerenderProxyTable() {
      this.proxyTableKey += 1;
    },

    forceRerenderProxyGroupTable() {
      this.proxyGroupTableKey += 1;
    },

    saveProxies() {
      this.showGroupNameDlg = true;
    },

    clearProxies() {
      this.proxyData.length = 0;
      this.forceRerenderProxyTable();
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
      this.$store.commit("SET_PROXY_GROUP_LIST", this.groupData);
    },
    clearGroup() {
      Object.keys(this.groupData).forEach(k => delete this.groupData[k]);
      this.groupData = {};
      this.groupTableData = [];
      this.forceRerenderProxyGroupTable();
    },
    newGroup() {},

    closeGroupNameDlg() {
      this.showGroupNameDlg = false;
    },

    setGroupNameError(err) {
      this.groupNameError = err;
      setInterval(() => (this.groupNameError = ""), 1500);
    },

    saveProxiesIntoGroup() {
      if (!this.newProxyGroupName) {
        this.setGroupNameError("Group name cannot be empty");
        return;
      } else if (this.newProxyGroupName in this.groupData) {
        this.setGroupNameError("Duplicated group name");
        return;
      }
      // let setting = this.$store.getters.accountSettings;
      this.groupData[this.newProxyGroupName] = {
        proxies: this._.cloneDeep(this.proxyData),
        status: {
          code: 3,
          message: this.proxyData.length
        }
      };

      // Vue.set(this.groupData, 'groupData', )

      this.setGroupTableData();
      this.$store.commit("SET_PROXY_LIST", this.proxyData);
      this.showGroupNameDlg = false;
      this.newProxyGroupName = "";
    }
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

