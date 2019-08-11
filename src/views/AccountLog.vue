<template>
  <div class="bg-nike-dark text-white p-24 px-16 w-full mt-4 route-view-container">
    <h3 class="text-white">Account Logs</h3>
    <p
      class="text-grey header-description"
    >This tab shows the status of the making of your Nike accounts</p>

    <log-table
      class="mt-5"
      :tConfig="tableConfig"
      :tData="tableData"
      :tHeight="90"
      :key="accountLogTableKey"
    ></log-table>
    <div class="button-group text-center px-16">
      <button
        class="float-left px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg raise"
        @click="exportLog"
      >Export</button>
      <button
        class="mx-2 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
        @click="startCreatingAccount"
      >Start</button>
      <button
        class="mx-2 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
        @click="stopCreatingAccount"
      >Stop</button>

      <button
        class="float-right px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
        @click="clearLog"
      >Clear</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { TaskQueue } from "cwait";
import LogTable from "../components/LogTable.vue";

export default {
  mounted() {
    this.$nextTick(function() {
      this.tableData = this.$store.getters.pendingList;
      console.log("AccountLog page : After did mount");
    });
  },
  sockets: {
    CreateLog(data) {
      console.log("CreateLog event is trigged on client.");

      if (typeof data === "string") console.log(data);
      else if (typeof data === "object") {
        this.tableData[data.index].status = {
          code: data.code,
          message: data.message
        };
        if (data.message.includes("phonenumber"))
          this.tableData[data.index].number = data.phonenumber;
        if (data.code === 6) {
          if (!data.message.includes("verified")) {
            this.$store.commit(
              "ADD_TO_CREATED_LIST",
              this.tableData[data.index]
            );
          } else {
            // Sending to Discord
            const webhook = require("webhook-discord");
            const defaultSettings = this.$store.getters.defaultSettings;
            const Hook = new webhook.Webhook(defaultSettings.discord);

            const msg = new webhook.MessageBuilder()
              .setName("ReportBot")
              .setColor("#ee2200")
              .setText("Added new account !")
              .addField("Username:", this.tableData[data.index]._email)
              .addField("Password:", this.tableData[data.index].password)
              .addField("Number:", this.tableData[data.index].number)
              .setImage(`https://www.countryflags.io/cn/shiny/32.png`)
              .setTime();

            Hook.send(msg);
          }
        }
      }
    }
  },
  components: {
    LogTable
  },
  data: function() {
    return {
      accountLogTableKey: 0,
      tableConfig: [
        { prop: "_index", name: "ID" },
        { prop: "first_name", name: "First Name" },
        { prop: "last_name", name: "Last Name" },
        { prop: "country", name: "Country" },
        { prop: "number", name: "Number" },
        { prop: "e_domain", name: "Email Domain" },
        { prop: "password", name: "Password" },
        { prop: "e_template", name: "Email Template " },
        { prop: "status", name: "Status" }
      ],
      tableData: this.$store.getters.pendingList
    };
  },
  methods: {
    forceRerenderAccountLogTable() {
      this.accountLogTableKey += 1;
    },
    exportLog() {},
    clearLog() {
      this.tableData = [];
      this.$store.commit("EMPTY_PENDING_LIST");
      this.forceRerenderAccountLogTable();
    },
    checkUniqueness(proxyInfo, userInfo, smsInfo) {
      console.log("checking uniqueness ");
      return axios
        .post("http://localhost:5000/create", {
          proxy: proxyInfo,
          user: userInfo,
          sms: smsInfo
        })
        .then(response => {
          console.log("server response:" + response.data.unique);
          // this.valid = response.data.unique;
          console.log(response.data);
        });
    },

    getProxies() {
      const selectedProxyGroup = this.$store.getters.defaultSettings.proxyGroup;
      const proxyGroupList = this.$store.getters.proxyGroupList;

      let proxies;
      if (!selectedProxyGroup || !(selectedProxyGroup.name in proxyGroupList)) {
        proxies = proxyGroupList[Object.keys(proxyGroupList)[0]];
      } else proxies = proxyGroupList[selectedProxyGroup.name].proxies;

      if (!proxies) {
        alert("Abort. No proxies selected");
        return;
      }

      // Choose only good proxies where status.code === 6
      return proxies
        .filter(proxy => proxy.status.code === 6)
        .map(item => item.proxy);
    },

    async startCreatingAccount() {
      console.log("startCreatingAccount");
      this.$socket.emit("join", {
        message: "Create account started"
      });

      const profileSettings = this.$store.getters.profileSettings;
      if (!profileSettings.profile || !profileSettings.profile.name) {
        alert("Please select proper profile on Settings");
        return;
      }

      axios
        .post("http://localhost:5000/create", {
          proxies: this.getProxies(),
          users: this.tableData.map((item, index) => {
            return {
              tableIndex: index,
              email: item._email,
              password: item.password,
              country: item.country,
              // gender: item.gender,
              firstName: item.first_name,
              lastName: item.last_name
            };
          }),
          sms: {
            provider: profileSettings.provider.name,
            username: profileSettings.username,
            token: profileSettings.token
          }
        })
        .then(response => {
          console.log("server response:" + response.data);
        });
    },
    async stopCreatingAccount() {}
  }
};
</script>
<style lang="scss">
</style>
