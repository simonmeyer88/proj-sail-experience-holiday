import { computed } from "vue";
import { useConfigStore } from "@/stores/config";

/**
 * Returns layout config
 * @returns {object}
 */
export const config = computed(() => {
  return useConfigStore().config;
});

/**
 * Returns theme mode
 * @returns {string}
 */
export const themeMode = computed(() => {
  return useConfigStore().getLayoutConfig("general.mode") as
    | "dark"
    | "light"
    | "system";
});

/**
 * Set the sidebar display
 * @returns {boolean}
 */
export const displaySidebar = computed(() => {
  return useConfigStore().getLayoutConfig("sidebar.display");
});

/**
 * Sidebar toggle
 * @returns {boolean}
 */
export const sidebarToggleDisplay = computed(() => {
  return useConfigStore().getLayoutConfig(
    "sidebar.default.minimize.desktop.enabled"
  );
});

/**
 * Check if footer container is fluid
 * @returns {boolean}
 */
export const footerWidthFluid = computed(() => {
  return useConfigStore().getLayoutConfig("footer.container") === "fluid";
});

/**
 * Footer display
 * @returns {boolean}
 */
export const footerDisplay = computed(() => {
  return useConfigStore().getLayoutConfig("footer.display");
});

/**
 * Check if header container is fluid
 * @returns {boolean}
 */
export const headerWidthFluid = computed(() => {
  return (
    useConfigStore().getLayoutConfig("header.default.container") === "fluid"
  );
});

/**
 * Header display
 * @returns {boolean}
 */
export const headerDisplay = computed(() => {
  return useConfigStore().getLayoutConfig("header.display");
});

/**
 * Returns header left part type
 * @returns {string}
 */
export const headerLeft = computed(() => {
  return useConfigStore().getLayoutConfig("header.left");
});

/**
 * Sidebar display
 * @returns {boolean}
 */
export const sidebarDisplay = computed(() => {
  return useConfigStore().getLayoutConfig("sidebar.display");
});

/**
 * Layout type
 * @returns {string}
 */
export const layout = computed(() => {
  return useConfigStore().getLayoutConfig("general.layout");
});

/**
 * Check if toolbar width is fluid
 * @returns {boolean}
 */
export const toolbarWidthFluid = computed(() => {
  return useConfigStore().getLayoutConfig("toolbar.container") === "fluid";
});

/**
 * Set the toolbar display
 * @returns {boolean}
 */
export const toolbarDisplay = computed(() => {
  return useConfigStore().getLayoutConfig("toolbar.display");
});

/**
 * Check if container width is fluid
 * @returns {boolean}
 */
export const contentWidthFluid = computed(() => {
  return useConfigStore().getLayoutConfig("content.container") === "fluid";
});

/**
 * Check if the sidebar menu is enabled
 * @returns {boolean}
 */
export const sidebarEnabled = computed(() => {
  return !!useConfigStore().getLayoutConfig("aside.display");
});

/**
 * Set the sidebar theme
 * @returns {string}
 */
export const sidebarTheme = computed(() => {
  return useConfigStore().getLayoutConfig("aside.theme");
});

/**
 * Set the subheader display
 * @returns {boolean}
 */
export const subheaderDisplay = computed(() => {
  return useConfigStore().getLayoutConfig("toolbar.display");
});

/**
 * Set the sidebar menu icon type
 * @returns {string}
 */
export const sidebarMenuIcons = computed(() => {
  return useConfigStore().getLayoutConfig("sidebar.default.menu.iconType");
});

/**
 * Light theme logo image
 * @returns {string}
 */
export const themeLightLogo = computed(() => {
  return useConfigStore().getLayoutConfig("main.logo.light");
});

/**
 * Dark theme logo image
 * @returns {string}
 */
export const themeDarkLogo = computed(() => {
  return useConfigStore().getLayoutConfig("main.logo.dark");
});

/**
 * Set the header menu icon type
 * @returns {string}
 */
export const headerMenuIcons = computed(() => {
  return useConfigStore().getLayoutConfig("header.default.menu.iconType");
});

/**
 * Set the header menu display
 * @returns {string}
 */
export const headerMenuDisplay = computed(() => {
  return useConfigStore().getLayoutConfig("header.default.menu.display");
});

/**
 * Page title display
 * @returns {boolean}
 */
export const pageTitleDisplay = computed(() => {
  return useConfigStore().getLayoutConfig("pageTitle.display");
});

/**
 * Page title breadcrumb display
 * @returns {boolean}
 */
export const pageTitleBreadcrumbDisplay = computed(() => {
  return useConfigStore().getLayoutConfig("pageTitle.breadcrumb");
});

/**
 * Page title direction display
 * @returns { "row" | "column" }
 */
export const pageTitleDirection = computed(() => {
  return useConfigStore().getLayoutConfig("pageTitle.direction");
});

/**
 * Scrolltop display
 * @returns {boolean}
 */
export const scrolltopDispaly = computed(() => {
  return useConfigStore().getLayoutConfig("scrolltop.display");
});

/**
 * Illustrations set
 * @returns {string}
 */
export const illustrationsSet = computed(() => {
  return useConfigStore().getLayoutConfig("illustrations.set");
});
