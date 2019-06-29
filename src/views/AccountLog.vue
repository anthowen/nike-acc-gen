<template>
  <div class="bg-nike-dark text-white p-24 px-16 w-full mt-4 route-view-container">
    <h3 class="text-white">Account Logs</h3>
    <p
      class="text-grey header-description"
    >This tab shows the status of the making of your Nike accounts</p>

    <log-table class="mt-5" :tConfig="tableConfig" :tData="tableData" :tHeight="90"></log-table>
    <div class="button-group text-center px-16">
      <button
        class="float-left px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg"
        @click="exportLog"
      >Export</button>
      <button
        class="mx-2 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg"
        @click="startCreatingAccount"
      >Start</button>
      <button
        class="mx-2 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
        @click="stopCreatingAccount"
      >Stop</button>

      <button
        class="float-right px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
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
        if (data.code === 6 && !data.message.includes("verified")) {
          this.$store.commit("ADD_TO_CREATED_LIST", this.tableData[data.index]);
        }
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
    exportLog() {},
    clearLog() {
      this.tableData = [];
      this.$store.commit("EMPTY_PENDING_LIST");
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
      // a concurrency parameter of 1 makes all api requests secuential
      const MAX_SIMULTANEOUS_DOWNLOADS = 2;
      // init your manager.
      const queue = new TaskQueue(Promise, MAX_SIMULTANEOUS_DOWNLOADS);

      const results = await Promise.all(
        this.tableData.map((item, index) => {
          if (item.status.code === 6) return;
          this.checkUniqueness(
            // {
            //   url: "35.246.246.24:3128"
            // },
            null,
            {
              tableIndex: index,
              email: item.email,
              password: item.password,
              country: item.country,
              // gender: item.gender,
              firstName: item.first_name,
              lastName: item.last_name
            },
            {
              provider: profileSettings.provider.name,
              username: profileSettings.username,
              token: profileSettings.token
            }
          );
        })
      ).then(responses => {
        // ...
        console.log("reponses.leng = " + responses.length);
      });

      console.log(queue);
      console.log(results);
    },
    async stopCreatingAccount() {}
  }
};
</script>
<style lang="scss">
</style>
