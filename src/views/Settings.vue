<template>
  <div class="bg-nike-dark text-white p-24 route-view-container">
    <div class="mt-4">
      <h3 class="text-white">Default Settings</h3>
      <p
        class="text-grey header-description"
      >These settings will be used when creating your Nike accounts</p>

      <div class="flex w-full pl-2 pr-2">
        <div class="relative flex-1 px-4 py-2 m-2">
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            v-model="defaultSettings.discord"
            type="text"
            placeholder="Discord Webhook"
          />
          <button
            class="test-discord-webhook absolute px-4 py-1 order-solid border-2 border-nike-green text-white text-lg rounded-lg bg-nike-darkest raise"
            @click="testDiscordWebhook"
          >Test</button>
        </div>

        <div class="flex-1 px-4 py-2 m-2">
          <nike-select
            :options="proxyGroup"
            :placeholder="'Proxy Group'"
            :selected="defaultSettings.proxyGroup"
            v-on:updateOption="onProxyGroupSelect"
            class="m-3 w-full"
          ></nike-select>
        </div>

        <div class="flex-1 px-4 py-2 m-2">
          <div class="flex justify-center m-3">
            <button
              class="ml-8 mr-4 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
              @click="saveDefaultSettings"
            >Save</button>
            <button
              class="mx-2 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
              @click="resetDefaultSettings"
            >Reset</button>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <h3 class="text-white">Account Profiles</h3>
      <p
        class="text-grey header-description"
      >These profiles will be used to generate unique phone numbers for your accounts</p>

      <div class="flex w-full pl-2 pr-2">
        <div class="flex-1 px-4 py-2 m-2">
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            type="text"
            placeholder="Profile Name"
            v-model="profileSettings.name"
          />
          <nike-select
            :options="profileList"
            :placeholder="'Load Profile'"
            :selected="profileSettings.profile"
            v-on:updateOption="onProfileSelect"
            class="m-3 w-full"
          ></nike-select>
        </div>

        <div class="flex-1 px-4 py-2 m-2">
          <nike-select
            :options="smsProviderList"
            :placeholder="'Sms Provider'"
            :selected="profileSettings.provider"
            v-on:updateOption="onSmsProviderSelect"
            class="m-3 w-full"
          ></nike-select>
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            type="text"
            placeholder="Token"
            v-model="profileSettings.token"
          />
          <div class="flex justify-center m-3">
            <button
              class="ml-8 mr-4 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
              @click="saveProfileSettings"
            >Save</button>
            <button
              class="mx-2 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
              @click="deleteProfileSettings"
            >Delete</button>
          </div>
        </div>

        <div class="flex-1 px-4 py-2 m-2">
          <nike-select
            :options="smsCountryList"
            :placeholder="'Service Country'"
            :selected="profileSettings.country"
            v-on:updateOption="onCountrySelect"
            class="m-3 w-full"
          ></nike-select>
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            id="providerUsername"
            type="text"
            placeholder="Username"
            v-model="profileSettings.username"
          />
        </div>
      </div>
    </div>

    <div class="mt-4">
      <h3 class="text-white">License Settings</h3>
      <p class="text-grey header-description">This setting will be used to manage license</p>

      <div class="flex w-full pl-2 pr-2">
        <div class="flex-1 px-4 py-2 m-2"></div>

        <div class="flex-1 px-4 py-2 m-2">
          <div class="flex justify-center m-3">
            <button
              class="ml-8 mr-4 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
              @click="uninstallLicense"
            >Deactivate</button>
          </div>
        </div>

        <div class="flex-1 px-4 py-2 m-2"></div>
      </div>
    </div>
  </div>
</template>
<script>
import NikeSelect from "../components/NikeSelect.vue";

export default {
  name: "home",
  mounted() {
    this.$nextTick(function() {
      this.profileSettings = this.$store.getters.profileSettings;
      this.profileList = this.$store.getters.profileList;
      this.defaultSettings = this.$store.getters.defaultSettings;

      const groupData = this.$store.getters.proxyGroupList;
      this.proxyGroup = [];
      for (let key in groupData) {
        this.proxyGroup.push({ name: key });
      }

      console.log("Settings page : After did mount");
    });
  },
  data() {
    return {
      profileSettings: this.$store.getters.profileSettings,
      profileList: this.$store.getters.profileList,
      defaultSettings: this.$store.getters.defaultSettings,
      proxyGroup: [],
      attemptCount: [
        { name: "1" },
        { name: "2" },
        { name: "3" },
        { name: "4" },
        { name: "5" },
        { name: "6" }
      ],
      availableSmsCountryList: {
        getsmscode: [
          // { name: "US" },
          { name: "CN" }
        ],
        pvacodes: [{ name: "US" }, { name: "UK" }, { name: "CN" }],
        smspva: [{ name: "UK" }],
        smsaccs: [{ name: "US" }, { name: "UK" }]
      },
      smsProviderList: [
        { name: "getsmscode" },
        { name: "smspva" },
        { name: "pvacodes" },
        { name: "smsaccs" }
      ]
    };
  },
  computed: {
    smsCountryList() {
      if (!this.profileSettings.provider) return [];
      return this.availableSmsCountryList[this.profileSettings.provider.name];
    }
  },
  components: {
    NikeSelect
  },
  methods: {
    onCountrySelect(payload) {
      this.profileSettings.country = payload;
    },

    onProxyGroupSelect(payload) {
      this.defaultSettings.proxyGroup = payload;
    },

    onSmsProviderSelect(payload) {
      this.profileSettings.provider = payload;
      this.profileSettings.country = null;
    },

    onProfileSelect(payload) {
      this.$store.commit("LOAD_PROFILE", payload);
      this.profileSettings = this.$store.getters.profileSettings;
      // this.$set(this, this.profileSettings, this.$store.getters.profileSettings);
      console.log(this.profileSettings);
    },

    isEmptyString(str) {
      return !str || 0 === str.length;
    },

    saveSettings() {},

    testDiscordWebhook() {
      if (!this.defaultSettings.discord) alert("Please input Webhook Url");
      window
        .fetch(this.defaultSettings.discord)
        .then(data => {
          console.log(data);
          if (data.status === 200) {
            alert("Webhook is working !");
            const webhook = require("webhook-discord");
            const Hook = new webhook.Webhook(this.defaultSettings.discord);
            Hook.info("ReportBot", "This is Discord Webhook test.");
          } else {
            alert("Webhook is not valid !");
          }
        })
        .catch(error => {
          console.log(error);
          alert("Webhook is not invalid !");
        });
    },
    saveDefaultSettings() {
      this.$store.commit("SET_DEFAULT_SETTINGS", this.defaultSettings);
    },
    resetDefaultSettings() {
      this.defaultSettings = {
        discord:
          "https://discordapp.com/api/webhooks/595354326764093481/CBpbGk-oJb9UXM-NGYE5HaLrYIxkpchqk19I19AGmsXwHO5v_oWkea3LTVdAUtVJ0cd-",
        proxyGroup: ""
      };
    },
    saveProfileSettings() {
      this.$store.commit("ADD_TO_PROFILE_LIST", this.profileSettings);
    },
    deleteProfileSettings() {
      this.$store.commit(
        "REMOVE_FROM_PROFILE_LIST",
        this.profileSettings.profile
      );
    },
    uninstallLicense() {
      window
        .fetch("http://localhost:5000/activate/uninstall", {
          method: "POST"
        })
        .then(response => response.json())
        .then(data => {
          if (data.status) {
            alert("Successfully uninstalled !");
          }
        }) // JSON-string from `response.json()` call
        .catch(error => {
          alert("Sorry, error occured !");
        });
    }
  }
};
</script>
<style>
.test-discord-webhook {
  right: 0.4rem;
  top: 1.54rem;
}
</style>
