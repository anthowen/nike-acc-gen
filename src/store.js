import Vue from "vue";
import Vuex from "vuex";
import VuexPersist from "vuex-persistfile";

const persist = new VuexPersist({
  path: "settings"
});
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    accountSettings: {
      firstName: "Garry",
      lastName: "Balack",
      emailDomain: "@gmail.com",
      emailTemplate: "garry.balack2019@gmail.com",
      accountQuantity: 1,
      birthdate: "12/03/1986",
      password: "@tSt!~3ad#a",
      number: "432658932",
      country: { name: "China" },
      gender: { name: "Male" },
      generatorType: { name: "Dot trick", type: 1 }
    },

    profileList: [
      // {
      //   name: "John",
      //   details: {
      //     token: "",
      //     username: ""
      //     ...
      //   }
      // }
    ],

    accountProfiles: {},

    profileSettings: {
      provider: { name: "smspva" },
      country: "",
      tier: "1002",
      username: "User1",
      token: "oG3bjxrWLS6cSD1iEUh40ERVbNkLCb",
      name: "Profile1",
      profile: ""
    },

    defaultSettings: {
      discord:
        "https://discordapp.com/api/webhooks/595354326764093481/CBpbGk-oJb9UXM-NGYE5HaLrYIxkpchqk19I19AGmsXwHO5v_oWkea3LTVdAUtVJ0cd-",
      typingSpeed: 3,
      threadCount: 2,
      automationDelay: 10,
      attemptCount: "",
      proxyGroup: ""
    },

    // This is data for 'Account Log' page, and is going to be created.
    pendingList: [],

    proxyList: [
      {
        host: "",
        port: "",
        username: "",
        password: "",
        status: "",
        group: ""
      }
    ],

    // This is data for 'Verify Log' page, and is going to be verified.
    createdList: [
      {
        country: "United Kingdom",
        number: "###########",
        account_email: "a.aswsdfba.l.a.ck2.0.1.9@gmail.com",
        password: "@tSt!~3ad#a",
        status: {
          code: 0,
          message: "Idle"
        }
      }
    ]
  },
  getters: {
    accountSettings: state => {
      return state.accountSettings;
    },
    profileSettings: state => {
      return state.profileSettings;
    },
    defaultSettings: state => {
      return state.defaultSettings;
    },
    pendingList: state => {
      return state.pendingList;
    },
    profileList: state => {
      return state.profileList;
    },
    createdList: state => {
      return state.createdList;
    }
  },
  mutations: {
    SET_ACCOUNT_SETTINGS: (state, payload) => {
      state.accountSettings = Vue._.cloneDeep(payload);
      console.log(state.accountSettings);
    },
    SET_DEFAULT_SETTINGS: (state, payload) => {
      state.defaultSettings = Vue._.cloneDeep(payload);
    },
    SET_PROFILE_SETTINGS: (state, payload) => {
      state.profileSettings = Vue._.cloneDeep(payload);
    },
    ADD_TO_PENDING_LIST: (state, data) => {
      console.log("committing ADD_TO_PENDING_LIST");
      data.every(item => state.pendingList.push(item));
    },
    EMPTY_PENDING_LIST: state => {
      console.log("committing EMPTY_PENDING_LIST");
      state.pendingList = [];
    },
    SET_CREATED_LIST: (state, data) => {
      console.log("committing SET_CREATED_LIST");

      state.pendingList = [...data];
      state.createdList = state.pendingList.filter(
        item => item.status.code === 6 // Blue Status, Success
      );

      console.log(state.createdList);
    },
    ADD_TO_CREATED_LIST: (state, data) => {
      console.log("committing ADD_TO_CREATED_LIST");

      const webhook = require("webhook-discord");
      const Hook = new webhook.Webhook(state.defaultSettings.discord);
      const msg = new webhook.MessageBuilder()
        .setName("Username")
        .setColor("#aabbcc")
        .setText("This is my webhook!")
        .addField("This", "is")
        .addField("my", "webhook!")
        .setImage("Image url")
        .setTime();

      Hook.send(msg);

      for (var i = 0; i < state.createdList.length; i++) {
        if (state.createdList[i].account_email === data.email) break;
      }
      if (i === state.createdList.length) {
        state.createdList.push({
          country: data.country,
          number: data.number,
          account_email: data.email,
          password: data.password,
          status: {
            code: 0,
            message: "Idle"
          }
        });
      }
    },

    // From Settings page, add current edit to ProfileList
    ADD_TO_PROFILE_LIST: (state, profile) => {
      if (!profile || !profile.name) {
        alert("No profile selected");
        return;
      }
      let existed = false;
      if (profile.name in state.accountProfiles) {
        existed = true;
      }
      state.accountProfiles[profile.name] = Vue._.cloneDeep(profile);
      delete state.accountProfiles[profile.name].profile;

      if (!existed) state.profileList.push({ name: profile.name });
    },

    //
    LOAD_PROFILE: (state, profile) => {
      if (!profile || !(profile.name in state.accountProfiles)) {
        alert("Selected profile does not exist");
        return;
      }
      console.log("Load profile: " + profile.name);
      state.profileSettings = Vue._.cloneDeep(
        state.accountProfiles[profile.name]
      );
      state.profileSettings.profile = profile;
    },

    // From Settings page, remove current edit from ProfileList
    REMOVE_FROM_PROFILE_LIST: (state, profile) => {
      if (!profile || !profile.name) {
        alert("No profile selected");
        return;
      }
      if (!(profile.name in state.accountProfiles)) {
        alert("Selected profile does not exist");
        return;
      }

      state.accountProfiles = Vue._.omit(state.accountProfiles, profile.name);
      const index = state.profileList.findIndex(pp => pp.name === profile.name);
      state.profileList = state.profileList.splice(index, 1);

      if (index >= state.profileList.length) {
        state.profileSettings = Vue._.cloneDeep(
          state.accountProfiles[state.profileList.slice(-1).pop()]
        );
      } else if (index >= 0) {
        state.profileSettings = Vue._.cloneDeep(
          state.accountProfiles[state.profileList[index]]
        );
      }
    },

    UpdateProfileList(state) {
      state.profileList = [];
      for (let key in state.accountProfiles)
        state.profileList.push({ name: key });
    }
  },
  plugins: [persist.subscribe()]
});
