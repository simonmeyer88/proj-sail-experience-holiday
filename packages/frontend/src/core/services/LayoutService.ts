import objectPath from "object-path";
import { config } from "@/core/helpers/config";
import { useBodyStore } from "@/stores/body";
import { useConfigStore } from "@/stores/config";

class LayoutService {
  public static bodyStore: any;
  public static configStore: any;

  /**
   * @description initialize default layout
   */
  public static init(): void {
    this.bodyStore = useBodyStore();
    this.configStore = useConfigStore();

    //empty body element classes and attributes
    LayoutService.emptyElementClassesAndAttributes(document.body);

    //setup layout
    LayoutService.initLayoutSettings();
    LayoutService.initToolbarSettings();
    LayoutService.initWidthSettings();

    // init layout components
    LayoutService.initDefaultLayout();
    LayoutService.initToolbar();
    LayoutService.initSidebar();
    LayoutService.initSidebarPanel();
    LayoutService.initHeader();
    LayoutService.initFooter();
  }

  // Init Layout settings
  public static initLayoutSettings(): void {
    const pageWidth = objectPath.get(config.value, "general.pageWidth");
    const layout = objectPath.get(config.value, "general.layout");

    this.bodyStore.addBodyAttribute({
      qualifiedName: "id",
      value: "kt_app_body",
    });
    this.bodyStore.addBodyClassname("app-" + layout);

    this.bodyStore.addBodyAttribute({
      qualifiedName: "data-kt-app-layout",
      value: layout,
    });

    // Light sidebar
    if (layout === "light-sidebar") {
      this.configStore.setLayoutConfigProperty(
        "header.default.fixed.desktop",
        false
      );

      this.configStore.setLayoutConfigProperty(
        "header.default.fixed.mobile",
        false
      );
    }

    if (layout === "light-sidebar" || layout === "dark-sidebar") {
      if (pageWidth === "default") {
        this.configStore.setLayoutConfigProperty(
          "header.default.container",
          "fluid"
        );

        this.configStore.setLayoutConfigProperty("toolbar.container", "fluid");

        this.configStore.setLayoutConfigProperty("content.container", "fluid");

        this.configStore.setLayoutConfigProperty("footer.container", "fluid");
      }
    }

    if (layout === "light-sidebar" || layout === "dark-sidebar") {
      this.configStore.setLayoutConfigProperty("sidebar.display", true);
    }

    if (layout === "light-header" || layout === "dark-header") {
      this.configStore.setLayoutConfigProperty("sidebar.display", false);

      if (pageWidth === "default") {
        this.configStore.setLayoutConfigProperty(
          "header.default.container",
          "fixed"
        );

        this.configStore.setLayoutConfigProperty("toolbar.container", "fixed");

        this.configStore.setLayoutConfigProperty("content.container", "fixed");

        this.configStore.setLayoutConfigProperty("footer.container", "fixed");
      }
    }
  }

  // Init toolbar settings
  public static initToolbarSettings(): void {
    const defaultContent = objectPath.get(
      config.value,
      "header.default.content"
    );

    if (defaultContent === "pageTitle") {
      this.configStore.setLayoutConfigProperty("footer.container", "fixed");
    }
  }

  // Init page width settings
  public static initWidthSettings(): void {
    const pageWidth = objectPath.get(config.value, "general.pageWidth");
    if (pageWidth !== "default") {
      const container = pageWidth === "fluid" ? "fluid" : "fixed";

      // Set page width
      this.configStore.setLayoutConfigProperty(
        "header.default.container",
        container
      );

      this.configStore.setLayoutConfigProperty("toolbar.container", container);

      this.configStore.setLayoutConfigProperty("content.container", container);

      this.configStore.setLayoutConfigProperty("footer.container", container);
    }
  }

  public static initDefaultLayout(): void {
    if (objectPath.get(config.value, "page.class")) {
      this.bodyStore.addClassname({
        position: "page",
        className: objectPath.get(config.value, "page.class"),
      });
    }

    if (objectPath.get(config.value, "page.container") === "fixed") {
      this.bodyStore.addClassname({
        position: "page-container",
        className: "container-xxl",
      });
    } else if (objectPath.get(config.value, "page.container") === "fluid") {
      this.bodyStore.addClassname({
        position: "page-container",
        className: "container-fluid",
      });
    }

    if (objectPath.get(config.value, "page.containerClass")) {
      this.bodyStore.addClassname({
        position: "page-container",
        className: objectPath.get(config.value, "page.containerClass"),
      });
    }

    if (objectPath.get(config.value, "wrapper.class")) {
      this.bodyStore.addClassname({
        position: "wrapper",
        className: objectPath.get(config.value, "wrapper.class"),
      });
    }

    if (objectPath.get(config.value, "wrapper.container") === "fixed") {
      this.bodyStore.addClassname({
        position: "wrapper-container",
        className: "container-xxl",
      });
    } else if (objectPath.get(config.value, "wrapper.container") === "fluid") {
      this.bodyStore.addClassname({
        position: "wrapper-container",
        className: "container-fluid",
      });
    }

    if (objectPath.get(config.value, "wrapper.containerClass")) {
      this.bodyStore.addClassname({
        position: "wrapper-container",
        className: "container-fluid",
      });
    }
  }

  public static initToolbar(): void {
    this.bodyStore.addBodyAttribute({
      qualifiedName: "data-kt-app-toolbar-enabled",
      value: "true",
    });

    if (objectPath.get(config.value, "toolbar.class")) {
      this.bodyStore.addClassname({
        position: "toolbar",
        className: objectPath.get(config.value, "toolbar.class"),
      });
    }

    if (objectPath.get(config.value, "toolbar.container") === "fixed") {
      this.bodyStore.addClassname({
        position: "toolbar-container",
        className: "container-xxl",
      });
    } else if (objectPath.get(config.value, "toolbar.container") === "fluid") {
      this.bodyStore.addClassname({
        position: "toolbar-container",
        className: "container-fluid",
      });
    }

    if (objectPath.get(config.value, "toolbar.containerClass")) {
      this.bodyStore.addClassname({
        position: "toolbar-container",
        className: objectPath.get(config.value, "toolbar.containerClass"),
      });
    }

    if (objectPath.get(config.value, "toolbar.fixed.desktop")) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-toolbar-fixed",
        value: "true",
      });
    }

    if (objectPath.get(config.value, "toolbar.fixed.mobile")) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-toolbar-fixed-mobile",
        value: "true",
      });
    }
  }

  public static initSidebar(): void {
    if (!objectPath.get(config.value, "sidebar.display")) {
      return;
    }

    this.bodyStore.addBodyAttribute({
      qualifiedName: "data-kt-app-sidebar-enabled",
      value: "true",
    });

    this.bodyStore.addBodyAttribute({
      qualifiedName: "data-kt-app-sidebar-fixed",
      value: "true",
    });

    if (
      objectPath.get(config.value, "sidebar.default.minimize.desktop.default")
    ) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-sidebar-minimize",
        value: "on",
      });
    }

    if (
      objectPath.get(config.value, "sidebar.default.minimize.desktop.hoverable")
    ) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-sidebar-hoverable",
        value: "true",
      });
    }

    this.bodyStore.addBodyAttribute({
      qualifiedName: "data-kt-app-sidebar-push-header",
      value: "true",
    });

    this.bodyStore.addBodyAttribute({
      qualifiedName: "data-kt-app-sidebar-push-toolbar",
      value: "true",
    });

    this.bodyStore.addBodyAttribute({
      qualifiedName: "data-kt-app-sidebar-push-footer",
      value: "true",
    });

    if (
      objectPath.get(config.value, "sidebar.primary.minimize.desktop.enabled")
    ) {
      if (
        objectPath.get(config.value, "sidebar.primary.minimize.desktop.default")
      ) {
        this.bodyStore.addBodyAttribute({
          qualifiedName: "data-kt-app-sidebar-primary-minimize",
          value: "on",
        });
      }

      if (
        objectPath.get(
          config.value,
          "sidebar.primary.minimize.desktop.hoverable"
        )
      ) {
        this.bodyStore.addBodyAttribute({
          qualifiedName: "data-kt-app-sidebar-primary-hoverable",
          value: "on",
        });
      }

      if (
        objectPath.get(config.value, "sidebar.primary.minimize.mobile.enabled")
      ) {
        if (
          objectPath.get(
            config.value,
            "sidebar.primary.minimize.desktop.default"
          )
        ) {
          this.bodyStore.addBodyAttribute({
            qualifiedName: "data-kt-app-sidebar-primary-minimize-mobile",
            value: "on",
          });
        }

        if (
          objectPath.get(
            config.value,
            "sidebar.primary.minimize.mobile.hoverable"
          )
        ) {
          this.bodyStore.addBodyAttribute({
            qualifiedName: "data-kt-app-sidebar-primary-hoverable-mobile",
            value: "on",
          });
        }
      }

      if (
        objectPath.get(config.value, "sidebar.primary.collapse.desktop.enabled")
      ) {
        if (
          objectPath.get(
            config.value,
            "sidebar.primary.collapse.desktop.default"
          )
        ) {
          this.bodyStore.addBodyAttribute({
            qualifiedName: "data-kt-app-sidebar-primary-collapse",
            value: "on",
          });
        }
      }

      if (
        objectPath.get(config.value, "sidebar.primary.collapse.mobile.enabled")
      ) {
        if (
          objectPath.get(
            config.value,
            "sidebar.primary.collapse.mobile.default"
          )
        ) {
          this.bodyStore.addBodyAttribute({
            qualifiedName: "data-kt-app-sidebar-primary-collapse-mobile",
            value: "on",
          });
        }
      }
    }
  }

  public static initSidebarPanel(): void {
    if (objectPath.get(config.value, "sidebarPanel.class")) {
      this.bodyStore.addClassname({
        position: "sidebar-panel",
        className: objectPath.get(config.value, "sidebarPanel.class"),
      });
    }

    if (objectPath.get(config.value, "sidebarPanel.fixed.desktop")) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-sidebar-panel-fixed",
        value: "true",
      });
    } else {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-sidebar-panel-fixed",
        value: "false",
      });
    }

    if (objectPath.get(config.value, "sidebarPanel.minimize.desktop.enabled")) {
      if (
        objectPath.get(config.value, "sidebarPanel.minimize.desktop.default")
      ) {
        this.bodyStore.addBodyAttribute({
          qualifiedName: "data-kt-app-sidebar-panel-minimize",
          value: "on",
        });
      }

      if (
        objectPath.get(config.value, "sidebarPanel.minimize.desktop.hoverable")
      ) {
        this.bodyStore.addBodyAttribute({
          qualifiedName: "data-kt-app-sidebar-panel-hoverable",
          value: "on",
        });
      }

      if (
        objectPath.get(config.value, "sidebarPanel.minimize.mobile.enabled")
      ) {
        if (
          objectPath.get(
            config.value,
            "sidebarPanel.minimize.desktop.hoverable"
          )
        ) {
          this.bodyStore.addBodyAttribute({
            qualifiedName: "data-kt-app-sidebar-panel-hoverable",
            value: "on",
          });
        }
      }
    }
  }

  public static initHeader(): void {
    if (!objectPath.get(config.value, "header.display")) {
      return;
    }

    if (objectPath.get(config.value, "header.default.fixed.desktop")) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-header-fixed",
        value: "true",
      });
    }

    if (objectPath.get(config.value, "header.default.fixed.mobile")) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-header-fixed-mobile",
        value: "true",
      });
    }
  }

  public static initFooter(): void {
    if (objectPath.get(config.value, "footer.fixed.desktop")) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-footer-fixed",
        value: "true",
      });
    }

    if (objectPath.get(config.value, "footer.fixed.mobile")) {
      this.bodyStore.addBodyAttribute({
        qualifiedName: "data-kt-app-footer-fixed-mobile",
        value: "true",
      });
    }
  }

  public static emptyElementClassesAndAttributes(element: HTMLElement): void {
    element.className = "";
    for (let i = element.attributes.length; i-- > 0; )
      element.removeAttributeNode(element.attributes[i]);
  }
}

export default LayoutService;
