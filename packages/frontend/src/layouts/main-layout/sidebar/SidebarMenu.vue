<template>
  <div class="app-sidebar-menu overflow-hidden flex-column-fluid text-white">
    <div
      id="kt_app_sidebar_menu_wrapper"
      class="app-sidebar-wrapper hover-scroll-overlay-y my-5"
      data-kt-scroll="true"
      data-kt-scroll-activate="true"
      data-kt-scroll-height="auto"
      data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer"
      data-kt-scroll-wrappers="#kt_app_sidebar_menu"
      data-kt-scroll-offset="5px"
      data-kt-scroll-save-state="true"
    >
      <!--begin::Menu-->
      <div
        id="#kt_app_sidebar_menu"
        class="menu menu-column menu-rounded menu-sub-indention px-3"
        data-kt-menu="true"
      >
        <template v-for="item in links" :key="item.name">
          <div class="menu-item py-2">
            <router-link
              :to="{
                name: item.name,
              }"
              class="menu-link fw-semibold fs-5 py-4"
              :active-class="'active'"
              :data-testid="'sidebar-link-' + item.name"
            >
              <span class="menu-icon fs-1" v-html="item.icon"> </span>
              <span class="menu-title">{{ item.title }}</span>
            </router-link>
          </div>
        </template>
        <div
          class="separator mb-5 mt-8 border-light separator-content"
          v-if="me.data.value?.role === 'STUDENT'"
        >
          <span class="fs-5 fw-bold text-muted">
            {{ locale === "en" ? "External" : "Externo" }}
          </span>
        </div>
        <template v-if="me.data.value?.role === 'STUDENT'">
          <template v-for="item in externalStudentLinks" :key="item.href">
            <div class="menu-item py-0 bg-light bg-opacity-5 rounded mb-2">
              <a
                :href="item.href"
                class="menu-link fw-semibold fs-5 py-3"
                :data-testid="'sidebar-link-' + item.title"
              >
                <span class="menu-title">{{ item.title }}</span>
              </a>
            </div>
          </template>

          <a
            class="whatsapp-link"
            href="https://whatsapp.com/channel/0029VaxRpo5LdQehl9EMwQ2i"
            target="_blank"
          >
            <i class="ki-solid ki-whatsapp"></i>
            WhatsApp
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useMe } from "@/server-state";

const { locale } = useI18n();

const me = useMe();

enum Roles {
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  NEWUSER = "NEWUSER",
}

const externalStudentLinksBase = [
  {
    title: {
      en: "Theory Exam Registration",
      es: "Inscribirse al examen teórico",
    },
    href: "https://aplicacions.agricultura.gencat.cat/darp_ecnp/inscripcio/sollicitudIndividual/prepareToSollicitudIndividual.do?reqCode=enter&menu=1",
  },
  {
    title: {
      es: "Solicitar el título",
      en: "Request Title",
    },
    href: "https://agricultura.gencat.cat/ca/detalls/Article/Expedicio-i-renovacio-per-Internet-de-titols-de-nautica-desbarjo",
  },
  {
    title: {
      es: "Consultar notas del examen",
      en: "Check Exam Results",
    },
    href: "https://aplicacions.agricultura.gencat.cat/darp_ecnp/examen/consultaNotesRevisions/prepareToConsultaNotesRevisions.do?reqCode=inici",
  },
];

const externalStudentLinks = computed(() => {
  return externalStudentLinksBase.map((link) => {
    return {
      ...link,
      title: link.title[locale.value as "en" | "es"],
    };
  });
});

const baseLinks = [
  {
    title: {
      en: "Dashboard",
      es: "Dashboard",
    },
    icon: '<i class="ki-duotone ki-home"></i>',
    name: "dashboard",
    roles: [Roles.ADMIN, Roles.STUDENT, Roles.TEACHER],
  },
  {
    title: {
      en: "Chat",
      es: "Chat",
    },
    icon: '<i class="ki-solid ki-messages"><i>',
    name: "chat",
    roles: [Roles.ADMIN, Roles.STUDENT, Roles.TEACHER],
  },
  {
    title: {
      en: "Course Management",
      es: "Gestión de cursos",
    },
    icon: '<i class="ki-solid ki-book"></i>',
    name: "management.courses",
    roles: [Roles.ADMIN, Roles.TEACHER],
  },
  {
    title: {
      en: "User Management",
      es: "Gestión de usuarios",
    },
    icon: '<i class="ki-solid ki-profile-user"></i>',
    name: "management.users",
    roles: [Roles.ADMIN, Roles.TEACHER],
  },
  {
    title: {
      en: "Video Management",
      es: "Gestión de videos",
    },
    icon: '<i class="ki-solid ki-youtube"></i>',
    name: "management.videos",
    roles: [Roles.ADMIN, Roles.TEACHER],
  },
  {
    title: {
      en: "Calendar Management",
      es: "Gestión de calendario",
    },
    icon: '<i class="ki-solid ki-calendar"></i>',
    name: "management.calendar",
    roles: [Roles.ADMIN, Roles.TEACHER],
  },
  {
    title: {
      en: "Calendar",
      es: "Calendario",
    },
    icon: '<i class="ki-solid ki-calendar"></i>',
    name: "student.calendar",
    roles: [Roles.STUDENT],
  },
  {
    title: {
      en: "Practice Progress",
      es: "Progreso de prácticas",
    },
    icon: '<i class="ki-solid ki-notepad"></i>',
    name: "student.tasks",
    roles: [Roles.STUDENT],
  },
  {
    title: {
      en: "Videos",
      es: "Videos",
    },
    icon: '<i class="ki-solid ki-youtube"></i>',
    name: "student.videos",
    requiresCourse: true,
    roles: [Roles.STUDENT],
  },
  {
    title: {
      en: "Files",
      es: "Archivos",
    },
    icon: '<i class="ki-solid ki-folder"></i>',
    name: "student.files",
    requiresCourse: true,
    roles: [Roles.STUDENT],
  },
  {
    title: {
      en: "File Management",
      es: "Gestión de archivos",
    },
    icon: '<i class="ki-solid ki-folder"></i>',
    name: "management.files",
    requiresCourse: true,
    roles: [Roles.ADMIN, Roles.TEACHER],
  },
  {
    title: {
      en: "Quiz Management",
      es: "Gestión de exámenes",
    },
    icon: '<i class="ki-solid ki-tablet-text-down"></i>',
    name: "management.quizzes",
    requiresCourse: true,
    roles: [Roles.ADMIN, Roles.TEACHER],
  },
  {
    title: {
      en: "Quizzes",
      es: "Exámenes",
    },
    icon: '<i class="ki-solid ki-tablet-text-down"></i>',
    name: "student.quizzes",
    requiresCourse: true,
    roles: [Roles.STUDENT],
  },
];

const links = computed(() => {
  const links = baseLinks
    .filter((link) => {
      if (me.data.value && link.roles.includes(me.data.value.role as Roles)) {
        if (me.data.value.role !== "STUDENT") {
          return true;
        }
        // if is STUDENT, check if he is enrolled in a course
        if (link.requiresCourse) {
          if (me.data.value.course) {
            return true;
          }
        } else {
          return true;
        }
      }
    })
    .map((link) => {
      return {
        ...link,
        title: link.title[locale.value as "en" | "es"],
      };
    });
  return links;
});
</script>

<style scoped lang="scss">
.menu {
  height: 100%;
}

.app-sidebar-menu {
  display: flex;
  flex-direction: column;

  .app-sidebar-wrapper {
    flex-grow: 1;
  }
}

.whatsapp-link {
  width: fit-content;
  margin: auto auto 0 10px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #25d366;
  transition: color 0.3s ease;

  i {
    font-size: 30px;
  }

  &:hover {
    color: var(--bs-primary);
  }
}
</style>
