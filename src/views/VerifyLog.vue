<template>
  <div class="bg-nike-dark flex-1 text-white p-24 px-16 mt-4 route-view-container">
    <h3 class="text-white">Verification</h3>
    <p class="text-grey header-description">This tab is for verifying your Nike accounts</p>

    <log-table class="mt-5" :tConfig="tableConfig" :tData="tableData" :tHeight="94"></log-table>
    <div class="button-group text-center px-16">
      <button
        class="float-left px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg"
        @click="exportLog"
      >Export</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg"
        @click="startVerification"
      >Start</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
        @click="stopVerification"
      >Stop</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg"
        @click="retryFailedAccount"
      >Retry</button>
      <button
        class="float-right px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
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
      }
    }
  },
  components: {
    LogTable
  },
  data: function() {
    return {
      tableConfig: [
        { prop: "_index", name: "ID" },
        { prop: "country", name: "Country" },
        { prop: "number", name: "Number" },
        { prop: "acc_email", name: "Account Email" },
        { prop: "password", name: "Account Password" },
        { prop: "status", name: "Status" }
      ],
      tableData: this.$store.getters.createdList
    };
  },
  methods: {
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
    clearLog() {},
    startVerification() {
      const profileSettings = this.$store.getters.profileSettings;
      if (!profileSettings.profile || !profileSettings.profile.name) {
        alert("Please select proper profile on Settings");
        return;
      }

      for (var i = 0; i < this.tableData.length; i++) {
        this.checkUniqueness(
          // {
          //   url: "23.254.164.198:3128"
          // },
          null,
          {
            tableIndex: i,
            country: this.tableData[i].country,
            email: this.tableData[i].account_email,
            password: this.tableData[i].password
          },
          {
            provider: profileSettings.provider.name,
            username: profileSettings.username,
            token: profileSettings.token
          }
        ).then(response => {
          console.log("second catch response");
          console.log(response);
        });
      }
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
