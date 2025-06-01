import { defineConfig } from "cypress";
import { makeEmailAccount } from "./cypress/plugins/email-account";
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173/#",
    setupNodeEvents: async (on) => {
      let emailAccount = await makeEmailAccount();
      on("task", {
        async getUserEmail(
          params: { reuse?: boolean } = {
            reuse: true,
          }
        ) {
          if (!params.reuse) {
            emailAccount = await makeEmailAccount();
          }
          return emailAccount.email;
        },

        getLastEmail() {
          return emailAccount.getLastEmail();
        },
      });
    },
    experimentalStudio: true,
    viewportHeight: 1080,
    viewportWidth: 1920,
  },
});
