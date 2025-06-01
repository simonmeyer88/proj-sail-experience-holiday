import PwaPopup from "./PwaPopup.vue";
import { vi } from "vitest";
import { mount } from "@vue/test-utils";

const setupWrapper = async (mockedUserAgent: string) => {
  vi.stubGlobal("navigator", {
    userAgent: mockedUserAgent,
  });

  const wrapper = mount(PwaPopup, {});

  // wait for modal to be visible
  await vi.waitFor(() => wrapper.find("[data-testid='pwa-popup']").exists());

  return wrapper;
};

test("it should render android modal", async () => {
  const mockedUserAgent = "android";
  const wrapper = await setupWrapper(mockedUserAgent);

  // Modal is visible and android instructions are shown
  expect(wrapper.find("[data-testid='pwa-popup']").exists()).toBe(true);
  expect(wrapper.find("[data-testid='android-instructions']").exists()).toBe(
    true
  );
});

test("it should render ios modal", async () => {
  const mockedUserAgent = "iphone";
  const wrapper = await setupWrapper(mockedUserAgent);

  // Modal is visible and ios instructions are shown
  expect(wrapper.find("[data-testid='pwa-popup']").exists()).toBe(true);
  expect(wrapper.find("[data-testid='ios-instructions']").exists()).toBe(true);
});

test("it should not render modal if user agent is not android or ios", async () => {
  const mockedUserAgent = "windows";
  const wrapper = await setupWrapper(mockedUserAgent);

  // Modal is not visible
  expect(wrapper.find("[data-testid='pwa-popup']").exists()).toBe(false);
});
