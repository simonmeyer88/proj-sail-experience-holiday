import * as yup from "yup";
import { defaultString } from "./common";
import {
  EVENT_MIN_SLOTS,
  EVENT_MAX_SLOTS,
  STR_MIN_LENGTH_LONG,
  STR_MAX_LENGTH_LONG,
  STR_MIN_LENGTH,
  STR_MAX_LENGTH,
} from "@aula-anclademia/common/validation-constants";

const repeatDatesSchema = yup.array().of(yup.string().required());
const repeatDaysSchema = yup.array().of(yup.number().required());

export const createEventSchema = yup.object({
  // no courseId means that the event is a club event
  startDate: yup.string().required(),
  endDate: yup.string().required(),
  totalSlots: yup.number().when("enableBooking", {
    is: true,
    then: () =>
      yup.number().min(EVENT_MIN_SLOTS).max(EVENT_MAX_SLOTS).required(),
  }),
  isClub: yup.boolean().required(),
  enableBooking: yup.boolean().default(true).required(),
  // predefinedEventId only needed if isClub is false
  predefinedEventId: yup.string().when("isClub", {
    is: false,
    then: () => yup.string().required(),
  }),
  title: yup.string().when("isClub", {
    is: true,
    then: () => yup.string().required().min(STR_MIN_LENGTH).max(STR_MAX_LENGTH),
  }),
  description: yup
    .string()
    .transform((value) => value || undefined)
    .min(STR_MIN_LENGTH_LONG)
    .max(STR_MAX_LENGTH_LONG),
  color: yup.string(),
  recurrenceRule: yup.string(),
  recurrenceEnd: yup.string().when("recurrenceRule", {
    is: (v: string) => v === "customDays" || v === "customDates",
    then: () => yup.string().required(),
  }),
  repeatDays: repeatDaysSchema.when("recurrenceRule", {
    is: "customDays",
    then: () => repeatDaysSchema.min(1).required(),
  }),
  repeatDates: repeatDatesSchema.when("recurrenceRule", {
    is: "customDates",
    then: () => repeatDatesSchema.min(1).required(),
  }),
});

export const createPredefinedEventSchema = yup.object({
  title: defaultString,
  courseIds: yup.array().min(1).of(yup.string().required()).required(),
});

export const updatePredefinedEventSchema = yup.object({
  title: defaultString,
  courseIds: yup.array().min(1).of(yup.string().required()).required(),
});

export const updateEventSchema = yup.object({
  startDate: yup.string().required(),
  endDate: yup.string().required(),
  totalSlots: yup.number().when("enableBooking", {
    is: true,
    then: () =>
      yup.number().min(EVENT_MIN_SLOTS).max(EVENT_MAX_SLOTS).required(),
  }),
  description: yup
    .string()
    .transform((value) => value || undefined)
    .min(STR_MIN_LENGTH_LONG)
    .max(STR_MAX_LENGTH_LONG),
  title: yup.string().when("isClub", {
    is: true,
    then: () => yup.string().required().min(STR_MIN_LENGTH).max(STR_MAX_LENGTH),
  }),
  // Won't be sent to the backend
  isClub: yup.boolean().default(false),
  enableBooking: yup.boolean().default(true).required(),
  color: yup.string(),
});

export const bookEventSchema = yup.object({
  isAccept: yup.boolean().isTrue().required(),
});
