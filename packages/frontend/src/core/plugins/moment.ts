import { dayjs } from "element-plus";
import moment from "moment-timezone";
import i18n from "@/core/plugins/i18n";

export const initMoment = () => {
  dayjs.Ls.en.weekStart = 1;
  // @ts-ignore
  dayjs.Ls.es ??= {};
  dayjs.Ls.es.weekStart = 1;

  moment.defineLocale("es", {
    months:
      "Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre".split(
        "_"
      ),
    monthsShort:
      "Ene._Feb._Mar._Abr._May._Jun._Jul._Ago._Sep._Oct._Nov._Dic.".split("_"),
    weekdays: "Domingo_Lunes_Martes_Miércoles_Jueves_Viernes_Sábado".split("_"),
    weekdaysShort: "Dom._Lun._Mar._Mié._Jue._Vie._Sáb.".split("_"),
    weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_Sá".split("_"),
    longDateFormat: {
      LT: "H:mm",
      LTS: "H:mm:ss",
      L: "DD/MM/YYYY",
      LL: "D [de] MMMM [de] YYYY",
      LLL: "D [de] MMMM [de] YYYY H:mm",
      LLLL: "dddd, D [de] MMMM [de] YYYY H:mm",
    },
    calendar: {
      sameDay: function () {
        //@ts-expect-error
        return "[hoy a la" + (this.hours() !== 1 ? "s" : "") + "] LT";
      },
    },
    relativeTime: {
      future: "en %s",
      past: "hace %s",
      s: "unos segundos",
      m: "un minuto",
      mm: "%d minutos",
      h: "una hora",
      hh: "%d horas",
      d: "un día",
      dd: "%d días",
      M: "un mes",
      MM: "%d meses",
      y: "un año",
      yy: "%d años",
    },
    ordinalParse: /\d{1,2}º/,
    ordinal: (number) => number + "º",
    week: {
      dow: 1, // Monday is the first day of the week.
      doy: 4, // The week that contains Jan 4th is the first week of the year.
    },
  });

  moment.locale(i18n.global.locale.value);

  moment().tz("Europe/Madrid").format();
};
