<template>
  <div class="bg-nike-dark flex-1 text-white p-24 px-16 mt-4 route-view-container">
    <h3 class="text-white">Verification</h3>
    <p class="text-grey header-description">This tab is for verifying your Nike accounts</p>

    <log-table
      class="mt-5"
      :tConfig="tableConfig"
      :tData="tableData"
      :tHeight="94"
      :key="verifyLogTableKey"
    ></log-table>
    <div class="button-group text-center px-16">
      <button
        class="float-left px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg raise"
        @click="exportLog"
      >Export</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
        @click="startVerification"
      >Start</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
        @click="stopVerification"
      >Stop</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg raise"
        @click="retryFailedAccount"
      >Retry</button>
      <button
        class="float-right px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
        @click="clearLog"
      >Clear</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import LogTable from "../components/LogTable.vue";

export default {
  mounted() {
    this.$nextTick(function() {
      this.tableData = this.$store.getters.createdList;
      console.log("Verify Log page : After did mount");
    });
  },
  sockets: {
    VerifyLog(data) {
      console.log("VerifyLog event is trigged on client.");

      if (typeof data === "string") console.log(data);
      else if (typeof data === "object") {
        this.tableData[data.index].status = {
          code: data.code,
          message: data.message
        };
        if (data.message.includes("phonenumber"))
          this.tableData[data.index].number = data.phonenumber;
        if (data.code === 6) {
          const webhook = require("webhook-discord");
          const defaultSettings = this.$store.getters.defaultSettings;
          const Hook = new webhook.Webhook(defaultSettings.discord);

          const msg = new webhook.MessageBuilder()
            .setName("ReportBot")
            .setColor("#ee2200")
            .setText("Added new account !")
            .addField("Username:", this.tableData[data.index].email)
            .addField("Password:", this.tableData[data.index].password)
            .addField("Number:", this.tableData[data.index].number)
            .setImage(`https://www.countryflags.io/${data.country}/32.png`)
            .setTime();

          Hook.send(msg);
        }
      }
    }
  },
  components: {
    LogTable
  },
  data: function() {
    return {
      verifyLogTableKey: 0,
      tableConfig: [
        { prop: "_index", name: "ID" },
        { prop: "country", name: "Country" },
        { prop: "number", name: "Number" },
        { prop: "account_email", name: "Account Email" },
        { prop: "password", name: "Account Password" },
        { prop: "status", name: "Status" }
      ],
      tableData: this.$store.getters.createdList
    };
  },
  methods: {
    forceRerenderVerifyLogTable() {
      this.verifyLogTableKey += 1;
    },
    checkUniqueness(proxyInfo, userInfo, smsInfo) {
      console.log("checking uniqueness ");
      return axios
        .post("http://localhost:5000/verify", {
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

    exportLog() {},

    clearLog() {
      this.tableData.length = 0;
      this.forceRerenderVerifyLogTable();
      this.$store.commit("EMPTY_CREATED_LIST");
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

    async startVerification() {
      const profileSettings = this.$store.getters.profileSettings;
      if (!profileSettings.profile || !profileSettings.profile.name) {
        alert("Please select proper profile on Settings");
        return;
      }

      axios
        .post("http://localhost:5000/verify", {
          proxies: this.getProxies(),
          users: this.tableData.map((item, index) => {
            return {
              tableIndex: index,
              country: this.tableData[index].country,
              email: this.tableData[index].account_email,
              password: this.tableData[index].password
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
    stopVerification() {},
    retryFailedAccount() {}
  }
};
</script>
<style lang="scss">
.button-group {
  .middle {
    // display: block;
    // margin: 0em auto;
    // width: 800px;
    display: flex;
    justify-content: center;
    // button {
    //   width: 20%;
    // }
  }
}
</style>
