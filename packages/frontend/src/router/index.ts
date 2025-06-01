import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from "vue-router";
import AuthService from "@/core/services/AuthService";
import { useConfigStore } from "@/stores/config";
import { Loader } from "@/router/progress";

// page translations
import i18n from "@/core/plugins/i18n";

const t = (key: string) => i18n.global.t(key).toString();

enum Role {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  NEWUSER = "NEWUSER",
  AWAITINGSTUDENT = "AWAITINGSTUDENT",
  AWAITINGTEACHER = "AWAITINGTEACHER",
  ALL = "ALL",
}

enum Status {
  LOGGEDIN = "LOGGEDIN",
  NOTLOGGEDIN = "NOTLOGGEDIN",
}

declare module "vue-router" {
  interface RouteMeta {
    roles?: Array<Role>;
    status?: Array<Status>;
    requiresCourse?: boolean;
  }
}

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/dashboard",
    component: () => import("@/layouts/main-layout/MainLayout.vue"),
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/DashboardView.vue"),
        meta: {
          roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT],
          status: [Status.LOGGEDIN],
        },
      },
      {
        path: "/profile",
        name: "profile",
        component: () => import("@/views/ProfileSettings.vue"),
        meta: {
          roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT],
          status: [Status.LOGGEDIN],
        },
      },
      {
        path: "/chat",
        name: "chat",
        component: () => import("@/views/ChatView.vue"),
        meta: {
          roles: [Role.ADMIN, Role.TEACHER, Role.STUDENT],
          status: [Status.LOGGEDIN],
        },
      },
      {
        path: "/management",
        meta: {
          roles: [Role.ADMIN, Role.TEACHER],
          status: [Status.LOGGEDIN],
        },
        children: [
          {
            path: "users",
            name: "management.users",
            component: () => import("@/views/management/UsersManagement.vue"),
          },
          {
            path: "users/:id",
            name: "management.users.view",
            component: () =>
              import("@/views/management/UserManagementView.vue"),
          },
          {
            path: "courses",
            name: "management.courses",
            component: () => import("@/views/management/CoursesManagement.vue"),
          },
          {
            path: "calendar",
            name: "management.calendar",
            component: () =>
              import("@/views/management/CalendarManagement.vue"),
          },
          {
            path: "files",
            name: "management.files",
            component: () => import("@/views/management/FilesManagement.vue"),
          },
          {
            path: "videos",
            name: "management.videos",
            component: () => import("@/views/management/VideosManagement.vue"),
          },
          {
            path: "quizzes",
            name: "management.quizzes",
            component: () => import("@/views/management/QuizzesManagement.vue"),
          },
          {
            path: "quizzes/:id",
            name: "management.quiz",
            component: () => import("@/views/management/QuizManagement.vue"),
          },
          {
            path: "students/:studentId/tasks",
            name: "management.student-tasks",
            component: () => import("@/views/management/StudentTasks.vue"),
          },
        ],
      },
      {
        path: "/student",
        meta: {
          roles: [Role.STUDENT],
          status: [Status.LOGGEDIN],
        },
        children: [
          {
            path: "tasks",
            name: "student.tasks",
            component: () => import("@/views/student/TasksStudent.vue"),
          },
          {
            path: "calendar",
            name: "student.calendar",
            component: () => import("@/views/student/CalendarStudent.vue"),
          },
          {
            path: "files",
            name: "student.files",
            component: () => import("@/views/student/FilesStudent.vue"),
            meta: {
              requiresCourse: true,
            },
          },
          {
            path: "videos",
            name: "student.videos",
            component: () => import("@/views/student/VideosStudent.vue"),
            meta: {
              requiresCourse: true,
            },
          },
          {
            path: "quizzes",
            name: "student.quizzes",
            component: () => import("@/views/student/QuizzesStudent.vue"),
            meta: {
              requiresCourse: true,
            },
          },
          {
            path: "quizzes/:id",
            name: "student.quiz",
            component: () => import("@/views/student/QuizStudent.vue"),
            meta: {
              requiresCourse: true,
            },
          },
        ],
      },
    ],
  },
  {
    path: "/onboarding",
    component: () => import("@/layouts/AuthLayout.vue"),
    meta: {
      status: [Status.LOGGEDIN],
      roles: [Role.NEWUSER],
    },
    children: [
      {
        path: "",
        name: "onboarding",
        component: () => import("@/views/OnboardingFlow.vue"),
      },
    ],
  },
  {
    path: "/auth",
    name: "auth",
    redirect: {
      name: "auth.sign-in",
    },
    component: () => import("@/layouts/AuthLayout.vue"),
    meta: {
      status: [Status.NOTLOGGEDIN],
      roles: [Role.ALL],
    },
    children: [
      {
        path: "sign-in",
        name: "auth.sign-in",
        component: () => import("@/views/auth/SignIn.vue"),
      },
      {
        path: "sign-up",
        name: "auth.sign-up",
        component: () => import("@/views/auth/SignUp.vue"),
      },
      {
        path: "password-reset",
        name: "auth.password-reset",
        component: () => import("@/views/auth/PasswordReset.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "/awaiting-approval",
        name: "awaiting-approval",
        component: () => import("@/views/AwaitingApproval.vue"),
        meta: {
          roles: [Role.AWAITINGSTUDENT, Role.AWAITINGTEACHER],
          status: [Status.LOGGEDIN],
        },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      status: [Status.LOGGEDIN, Status.NOTLOGGEDIN],
      roles: [Role.ALL],
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  Loader.start();
  const configStore = useConfigStore();
  document.title = `Anclademia - ${t("router." + (to.name as string))}`;
  configStore.resetLayoutConfig();
  // check if user is logged in
  // returns null if not logged in
  const authedUser = await AuthService.checkAuth();

  const isLoggedIn = authedUser !== undefined && authedUser !== null;
  const role = authedUser?.role as Role;
  const isEnrolledInCourse = !!authedUser?.course?.id;

  let supportedRoles = to.meta.roles as Role[];
  if (supportedRoles.includes(Role.ALL)) {
    supportedRoles = [
      Role.NEWUSER,
      Role.STUDENT,
      Role.TEACHER,
      Role.ADMIN,
      Role.AWAITINGSTUDENT,
      Role.AWAITINGTEACHER,
    ];
  }
  const supportedStatus = to.meta.status as Status[];
  if (!isLoggedIn && !supportedStatus.includes(Status.NOTLOGGEDIN)) {
    return next({ replace: true, name: "auth" });
  } else if (
    (isLoggedIn && !supportedStatus.includes(Status.LOGGEDIN)) ||
    (isLoggedIn && !supportedRoles.includes(role))
  ) {
    if (role === Role.NEWUSER) {
      return next({ name: "onboarding" });
    }
    if (role === Role.AWAITINGSTUDENT || role === Role.AWAITINGTEACHER) {
      return next({ name: "awaiting-approval" });
    } else {
      return next({ name: "dashboard" });
    }
  } else if (
    isLoggedIn &&
    role === "STUDENT" &&
    to.meta.requiresCourse &&
    !isEnrolledInCourse
  ) {
    return next({ name: "dashboard" });
  }
  return next();
});

router.afterEach(() => {
  Loader.stop();
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});
export default router;
