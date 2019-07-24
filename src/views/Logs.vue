<template>
  <div class="bg-nike-dark text-white p-24 px-16 w-full mt-4 route-view-container">
    <h3 class="text-white">Program Logs</h3>
    <p
      class="text-grey header-description"
    >This page shows logs status of creating and verification of accounts.</p>
    <div class="mt-8 logs">
      <ul>
        <li v-for="item in logs" :key="item.id">
          <div class="flex log-line">
            <span class="message">{{ item.message }}</span>
            <span class="time">{{ item.time }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  sockets: {
    CreateLog(data) {
      this.addLogHistory(typeof data === "string" ? data : data.message);
    },
    VerifyLog(data) {
      this.addLogHistory(typeof data === "string" ? data : data.message);
    },
    ProxyStatus(data) {
      this.addLogHistory(typeof data === "string" ? data : data.message);
    }
  },
  methods: {
    addLogHistory(message) {
      this.logs.push({
        message: message,
        time: new Date().toLocaleString()
      });
    }
  },
  data: function() {
    return {
      logs: [
        {
          message:
            "A UK account created, email is garry.balack21@gmail.com, with password '#2daidfj#5!'",
          time: "2019-07-24 11:50:00 AM"
        },
        {
          message:
            "A US account created, email is john.black21@gmail.com, with password '#2daidfj#5!'",
          time: "2019-07-24 11:50:00 AM"
        },
        {
          message:
            "A Chinese account created, email is rui.hua607@gmail.com, with password '#2daidfj#5!'",
          time: "2019-07-24 11:50:00 AM"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.logs {
  ul {
    li {
      list-style-type: none;
      border-bottom: 1px solid #1b1b1b;
      padding: 10px 5px;

      .log-line {
        justify-content: space-between;
        align-items: flex-end;

        .message {
          color: #71fc98;
        }

        .time {
          color: #8564a9;
        }
      }
    }
  }
}
</style>