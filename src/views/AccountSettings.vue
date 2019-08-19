<template>
  <div class="bg-nike-dark text-white pt-24 px-16 mt-4 w-full route-view-container">
    <h3 class="text-white">Account Creation</h3>
    <p
      class="text-grey header-description"
    >This information will be used to create your Nike accounts</p>

    <transition name="fade">
      <p v-if="errors.length" class="px-20 pt-8 text-nike-orange">
        <b>Please correct the following error(s):</b>
      </p>
      <ul>
        <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
      </ul>
    </transition>
    <div class="flex w-full pl-2 pr-2">
      <div class="flex-1 px-4 py-2 m-2">
        <input
          class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
          v-model="settings.firstName"
          placeholder="First Name"
        />
        <input
          class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
          v-model="settings.birthdate"
          placeholder="Birthdate mm/dd/yyyy"
        />
        <input
          class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey mx-3 mt-3"
          id="eDomain"
          type="text"
          v-model="settings.emailDomain"
          placeholder="Email Domain"
        />
        <p class="mx-4 mb-3 text-nike-blue-grey">
          <span class="mt-0 text-xs">If using catchall - @yourdomain</span>
          <br />
          <span class="mt-0 text-xs">If using dot trick or plus trick - @gmail.com</span>
        </p>

        <input
          class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey mx-3 mt-3"
          id="eTemplate"
          type="email"
          v-model="settings.emailTemplate"
          placeholder="Email Template"
        />
        <p class="mx-4 mb-3 text-nike-blue-grey">
          <span class="mt-0 text-xs">If using catchall - Random</span>
          <br />
          <span class="mt-0 text-xs">If using dot or plus trick - email+#@gmail.com</span>
        </p>

        <input
          class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
          id="accountQuantity"
          type="number"
          v-model="settings.accountQuantity"
          placeholder="Account Quantity"
          min="1"
        />
      </div>

      <div class="flex-1 px-4 py-2 m-2">
        <input
          class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey m-3"
          id="lastName"
          type="text"
          v-model="settings.lastName"
          placeholder="Last Name"
        />

        <nike-select
          :options="genderOptions"
          :placeholder="'Gender'"
          :selected="settings.gender"
          v-on:updateOption="onGenderSelect"
          class="m-3 w-full"
        ></nike-select>

        <input
          class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey mx-3 mt-3"
          id="lastName"
          type="text"
          v-model="settings.password"
          placeholder="Password"
        />
        <p class="mx-4 mb-3 text-nike-blue-grey">
          <span class="mt-0 text-xs">
            Minimum of
            <span class="text-green">8</span> characters
            <span class="text-green">1</span> uppercase letter
            <span class="text-green">1</span> lowercase letter
            <span class="text-green">1</span> number
          </span>
        </p>

        <div class="py-4 m-3">
          <input
            id="randomName"
            class="checkbox-custom"
            name="randomName"
            type="checkbox"
            v-model="settings.randomNameSupported"
          />
          <label for="randomName" class="checkbox-custom-label text-white">Random Name</label>
        </div>

        <div class="py-4 m-3">
          <input
            id="randomPassword"
            class="checkbox-custom"
            name="randomPassword"
            type="checkbox"
            v-model="settings.randomPasswordSupported"
          />
          <label for="randomPassword" class="checkbox-custom-label text-white">Random Password</label>
        </div>
      </div>

      <div class="flex-1 px-4 py-2 m-2">
        <nike-select
          :options="countryOptions"
          :placeholder="'Country'"
          :selected="settings.country"
          v-on:updateOption="onCountrySelect"
          class="m-3 w-full"
        ></nike-select>

        <nike-select
          :options="mailTrickOptions"
          :placeholder="'Generator Type'"
          :selected="settings.generatorType"
          v-on:updateOption="onMailTrickSelect"
          class="m-3 w-full"
        ></nike-select>

        <input
          class="border border-nike-border bg-nike-darkest rounded-lg h-10 w-full py-2 px-3 text-grey mx-3 mt-3"
          id="lastName"
          type="text"
          placeholder="Number"
        />

        <p class="mx-4 mb-3 text-nike-blue-grey invisible">
          <span class="mt-0 text-xs">
            Minimum of
            <span class="text-green">8</span> characters
            <span class="text-green">1</span> uppercase letter
            <span class="text-green">1</span> lowercase letter
            <span class="text-green">1</span> number
          </span>
        </p>

        <div class="py-4 m-3">
          <input
            id="randomNumber"
            class="checkbox-custom"
            name="randomNumber"
            type="checkbox"
            v-model="settings.randomNumberSupported"
          />
          <label for="randomNumber" class="checkbox-custom-label text-white">Random Number</label>
        </div>

        <div class="py-4 m-3">
          <input
            id="randomBirthdate"
            class="checkbox-custom"
            name="randomBirthdate"
            type="checkbox"
            v-model="settings.randomDobSupported"
          />
          <label for="randomBirthdate" class="checkbox-custom-label text-white">Random Birthdate</label>
        </div>
      </div>
    </div>

    <div class="button-group text-center px-16">
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-green text-white text-lg rounded-lg raise"
        @click="saveSettings"
      >Save</button>
      <button
        class="mx-5 px-10 py-2 order-solid border-2 border-nike-red text-white text-lg rounded-lg raise"
        @click="resetSettings"
      >Reset</button>
      <button
        class="float-right mx-5 px-10 py-2 order-solid border-2 border-nike-yellow text-white text-lg rounded-lg raise"
      >Create</button>
    </div>
  </div>
</template>

<script>
import NikeSelect from "../components/NikeSelect.vue";
import * as DotTricker from "../helpers/DotGmailGenerator";
import faker from "faker";

export default {
  name: "AccountSettings",
  data() {
    return {
      errors: [],
      settings: this.$store.getters.accountSettings,
      mailTrickOptions: [
        { name: "Dot trick", type: 1 },
        { name: "Plus trick", type: 2 },
        { name: "Catchall", type: 3 }
      ],
      genderOptions: [{ name: "Male" }, { name: "Female" }],
      currentProvider: "",
      availableSmsCountryList: {
        getsmscode: [
          // { name: "United States" },
          { name: "China" }
        ],
        pvacodes: [
          { name: "United States" },
          { name: "United Kingdom" },
          { name: "China" }
        ],
        smspva: [{ name: "United Kingdom" }],
        smsaccs: [{ name: "United States" }, { name: "United Kingdom" }]
      }
    };
  },
  computed: {
    countryOptions() {
      if (!this.currentProvider) return [];
      return this.availableSmsCountryList[this.currentProvider];
    }
  },
  mounted() {
    this.$nextTick(function() {
      this.settings = this.$store.getters.accountSettings;
      console.log("AccountSettings page : After did mount");

      const profileSettings = this.$store.getters.profileSettings;
      if (!profileSettings.profile || !profileSettings.profile.name) {
        alert("Please make sure that you selected correct profile on Settings");
      } else {
        this.currentProvider = profileSettings.provider.name;
      }
    });
  },
  components: {
    NikeSelect
  },
  methods: {
    // onSelect callbacks
    onMailTrickSelect(payload) {
      this.settings.generatorType = payload;
      console.log(payload);
      if (this.settings.generatorType.type === 3) {
        // catchall
        if (this.settings.emailDomain === "@gmail.com") {
          this.settings.emailDomain = "";
          this.settings.emailTemplate = "";
        }
      } else {
        this.settings.emailDomain = "@gmail.com";
      }
    },

    onCountrySelect(payload) {
      console.log(payload);
      this.settings.country = payload;
    },

    onGenderSelect(payload) {
      console.log(payload);
      this.settings.gender = payload;
    },

    // helpers
    isEmptyString(str) {
      return !str || 0 === str.length;
    },

    getRandomString(len) {
      return [...Array(len)]
        .map(() => (~~(Math.random() * 36)).toString(36))
        .join("");
    },

    // validation
    validEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },

    validate() {
      this.errors = [];

      if (
        !this.settings.randomNameSupported &&
        this.isEmptyString(this.settings.firstName)
      ) {
        this.errors.push("FirstName required.");
      }
      if (
        !this.settings.randomNameSupported &&
        this.isEmptyString(this.settings.lastName)
      ) {
        this.errors.push("LastName required.");
      }

      if (!this.settings.country) {
        this.errors.push("Country is required.");
      }

      if (!this.settings.gender) {
        this.errors.push("Gender is required.");
      }

      if (!this.settings.generatorType) {
        this.errors.push("Generator type is required.");
      } else if (this.settings.generatorType.type < 3) {
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
        return false;
      }
      return true;
    },

    // button click actions
    saveSettings() {
      if (this.validate()) {
        this.$store.commit("SET_ACCOUNT_SETTINGS", this.settings);
        this.$store.commit("ADD_TO_PENDING_LIST", this.getMockedAccountList());
        alert("Settings saved");
      }
    },

    resetSettings() {
      Object.keys(this.settings).forEach(key => {
        if (key === "accountQuantity") this.settings[key] = 0;
        else this.settings[key] = "";
        //use key and value here
      });
      this.errors.length = 0;
    },

    getMockedAccountList() {
      let data = [],
        dotEmails,
        dummy = {
          first_name: this.settings.firstName,
          last_name: this.settings.lastName,
          country: this.settings.country.name,
          number: "############",
          e_domain: this.settings.emailDomain,
          password: this.settings.password,
          e_template: this.settings.emailTemplate,
          // gender: this.settings.gender.name,
          status: {
            code: 0,
            message: "Idle"
          },
          _email: "",
          _birthdate: this.settings.birthdate
        };

      // Pre settings
      if (this.settings.generatorType.type === 3) {
        dummy.e_template = "";
      } else {
        var atPos = dummy.e_template.indexOf("@");
        if (atPos > 0) dummy.e_template = dummy.e_template.substring(0, atPos);
      }

      if (this.settings.generatorType.type === 1) {
        dotEmails = DotTricker.generate(dummy.e_template.replace(/\./g, ""));
      }

      for (var i = 0; i < this.settings.accountQuantity; i++) {
        let item = Object.assign({}, dummy);

        // random profiles : Name, Password, Date of Birth
        if (this.settings.randomNameSupported) {
          item.first_name = faker.name.firstName();
          item.last_name = faker.name.lastName();
        }

        if (this.settings.randomPasswordSupported) {
          item.password = faker.internet.password();
          const numCounts = (item.password.match(/\d/g) || []).length;
          if (!numCounts) item.password += "0";
        }

        if (this.settings.randomDobSupported) {
          item._birthdate =
            faker.random.number(29) +
            "/" +
            faker.random.number(13) +
            "/" +
            faker.random.number({ min: 1950, max: 1999 });
        }

        // Email and Email Template setting
        if (this.settings.generatorType.type === 1) {
          item._email = dotEmails[Math.floor(Math.random() * dotEmails.length)];
        } else if (this.settings.generatorType.type === 2) {
          item._email = item.e_template + "+" + this.getRandomString(6);
        } else if (this.settings.generatorType.type === 3) {
          item._email =
            item.first_name.toLowerCase() + "." + item.last_name.toLowerCase();
        }

        item.e_template = item._email;
        item._email += item.e_domain;

        data.push(item);
      }

      return data;
    }
  }
};
</script>

<style>
/* You can define Your CSS here ...
I'm not using Bootstrap. Now using Tailwind CSS, utility css. it's easy to read ? let me know if you hav problems.
*/

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

/* Custom checkbox */
.checkbox-custom,
.radio-custom {
  opacity: 0;
  position: absolute;
}

.checkbox-custom,
.checkbox-custom-label,
.radio-custom,
.radio-custom-label {
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
}

.checkbox-custom-label,
.radio-custom-label {
  position: relative;
}

.checkbox-custom + .checkbox-custom-label:before,
.radio-custom + .radio-custom-label:before {
  content: "";
  background: transparent;
  border: 2px solid #fa6025;
  display: inline-block;
  vertical-align: middle;
  width: 20px;
  height: 20px;
  padding: 1px 0px;
  margin-right: 10px;
  text-align: center;
  border-radius: 0.4rem;
}

.checkbox-custom:checked + .checkbox-custom-label:before {
  background: #fa6025;
  box-shadow: inset 0px 0px 0px 7px #0b1116;
}

.radio-custom + .radio-custom-label:before {
  border-radius: 50%;
}

.radio-custom:checked + .radio-custom-label:before {
  background: transparent;
  box-shadow: inset 0px 0px 0px 4px #fff;
}

.checkbox-custom:focus + .checkbox-custom-label,
.radio-custom:focus + .radio-custom-label {
  outline: 1px solid #ddd; /* focus style */
}
</style>
