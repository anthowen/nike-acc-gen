<template>
  <div class="bg-nike-dark text-white p-24 route-view-container">
    <div class="mt-4">
      <h3 class="text-white">Default Settings</h3>
      <p
        class="text-grey header-description"
      >These settings will be used when creating your Nike accounts</p>

      <div class="flex w-full pl-2 pr-2">
        <div class="flex-1 px-4 py-2 m-2">
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            v-model="defaultSettings.discord"
            type="text"
            placeholder="Discord Webhook"
          >
          <nike-select
            :options="proxyGroup"
            :placeholder="'Proxy Group'"
            :selected="defaultSettings.discord"
            v-on:updateOption="onCountrySelect"
            class="m-3 w-full"
          ></nike-select>
        </div>

        <div class="flex-1 px-4 py-2 m-2">
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            id="lastName"
            type="text"
            placeholder="Typing Speed (char/sec)"
          >
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            id="lastName"
            type="text"
            placeholder="Thread Count"
          >
          <div class="flex justify-center m-3">
            <button
              class="ml-8 mr-4 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg"
              @click="saveDefaultSettings"
            >Save</button>
            <button
              class="mx-2 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
              @click="resetDefaultSettings"
            >Reset</button>
          </div>
        </div>

        <div class="flex-1 px-4 py-2 m-2">
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            id="lastName"
            type="text"
            placeholder="Automation Delay"
          >
          <nike-select
            :options="attemptCount"
            :placeholder="'Attempt Count'"
            :selected="settings.generatorType"
            v-on:updateOption="onCountrySelect"
            class="m-3 w-full"
          ></nike-select>
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
          >
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            type="text"
            placeholder="Token"
          >
          <nike-select
            :options="proxyGroup"
            :placeholder="'Load Profile'"
            :selected="defaultSettings.discord"
            v-on:updateOption="onCountrySelect"
            class="m-3 w-full"
          ></nike-select>
        </div>

        <div class="flex-1 px-4 py-2 m-2">
          <nike-select
            :options="smsProvider"
            :placeholder="'Sms Provider'"
            :selected="defaultSettings.discord"
            v-on:updateOption="onCountrySelect"
            class="m-3 w-full"
          ></nike-select>
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            id="providerUsername"
            type="text"
            placeholder="Username"
          >
          <div class="flex justify-center m-3">
            <button
              class="ml-8 mr-4 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg"
              @click="saveProfileSettings"
            >Save</button>
            <button
              class="mx-2 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg"
              @click="deleteProfileSettings"
            >Delete</button>
          </div>
        </div>

        <div class="flex-1 px-4 py-2 m-2">
          <nike-select
            :options="smsCountry"
            :placeholder="'Service Country'"
            :selected="defaultSettings.discord"
            v-on:updateOption="onCountrySelect"
            class="m-3 w-full"
          ></nike-select>
          <input
            class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
            id="smsTier"
            type="text"
            placeholder="Tier (Cloud sms)"
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import NikeSelect from "../components/NikeSelect.vue";

export default {
  name: "home",
  data() {
    return {
      proxyGroup: [
        { name: "Group 1" },
        { name: "Group 2" },
        { name: "Group 3" },
        { name: "Group 4" }
      ],
      attemptCount: [
        { name: "1" },
        { name: "2" },
        { name: "3" },
        { name: "4" },
        { name: "5" },
        { name: "6" }
      ],
      smsCountry: [{ name: "Russia" }, { name: "China" }],
      smsProvider: [{ name: "getsmscode" }, { name: "simsms" }],
      errors: [],
      defaultSettings: {
        discord: ""
      },
      settings: {},
      defaultSelectOptions: []
    };
  },
  mounted() {
    this.$nextTick(function() {
      // this.settings = this.$store.getters.accountSettings;
      console.log("after did mount");
    });
  },
  components: {
    NikeSelect
  },
  methods: {
    onCountrySelect(payload) {
      console.log(payload);
    },

    isEmptyString(str) {
      return !str || 0 === str.length;
    },

    saveSettings() {
      this.errors = [];

      if (this.isEmptyString(this.settings.firstName)) {
        this.errors.push("FirstName required.");
      }
      if (this.isEmptyString(this.settings.lastName)) {
        this.errors.push("LastName required.");
      }
      if (this.settings.generatorType.type < 3) {
        if (this.isEmptyString(this.settings.emailTemplate)) {
          this.errors.push("Email Template is required.");
        } else if (!this.validEmail(this.settings.emailTemplate)) {
          this.errors.push("Valid email template is required.");
        }
      }

      if (this.isEmptyString(this.settings.emailDomain)) {
        this.errors.push("Email Domain is required.");
      } else if (!this.settings.emailDomain.startsWith("@")) {
        this.errors.push("Email Domain should start with @");
      } else if (!this.settings.emailDomain.includes(".")) {
        this.errors.push("Email Domain is not valid");
      }

      if (this.errors.length) {
        return;
      }

      this.$store.commit("SET_ACCOUNT_SETTINGS", this.settings);
    },

    saveDefaultSettings() {},
    resetDefaultSettings() {},
    saveProfileSettings() {},
    deleteProfileSettings() {}
  }
};
</script>

