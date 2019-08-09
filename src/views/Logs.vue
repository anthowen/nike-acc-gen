<template>
  <div class="bg-nike-dark text-white p-24 px-16 w-full mt-4 route-view-container">
    <h3 class="text-white">Program Logs</h3>
    <p
      class="text-grey header-description"
    >This page shows logs status of creating and verification of accounts.</p>

    <log-table
      class="mt-5"
      :tName="'applicationLogTable'"
      :tConfig="logTableConfig"
      :tData="logData"
      :tHeight="90"
      :key="logTableKey"
    ></log-table>

    <div class="button-group text-center px-16">
      <button
        class="ml-8 mr-4 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
        @click="exportLogs"
      >Export</button>
      <button
        class="mx-2 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
        @click="clearLogs"
      >Clear</button>
    </div>
  </div>
</template>

<script>
import LogTable from "../components/LogTable.vue";
export default {
  mounted() {
    this.$nextTick(function() {
      console.log("Logs page component did mount");
      this.logData = [];
      this.$store.getters.appLogs.every(log => this.logData.push(log));
    });
  },
  components: {
    LogTable
  },
  sockets: {
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
    },

    ApplicationLog(data) {
      console.log("catchted in Log.vue", data);
      //   this.addLogHistory(typeof data === "string" ? data : data.message);
      //   this.$emit("scrollToBottom", "applicationLogTable");
    }
  },
  methods: {
    addLogHistory(message, tag, index) {
      this.logData.unshift({
        message: message,
        type: tag + (!index ? "" : " #" + index),
        time: new Date().toLocaleString()
      });
      this.forceRerenderLogTable();
    },
    forceRerenderLogTable() {
      this.logTableKey += 1;
    },
    clearLogs() {
      this.logData = [];
      this.$store.commit("EMPTY_APPLICATION_LOGS");
      this.forceRerenderLogTable();
    },
    exportLogs() {}
  },
  data: function() {
    return {
      logTableKey: 0,
      logTableConfig: [
        { prop: "_index", name: "ID" },
        { prop: "message", name: "Message" },
        { prop: "type", name: "Type" },
        { prop: "time", name: "Time" }
      ],
      logData: this.$store.getters.appLogs
    };
  }
};
</script>

<style lang="scss" scoped>
.logs-list {
  height: 73vh;
  padding-right: 10px;
}
</style>