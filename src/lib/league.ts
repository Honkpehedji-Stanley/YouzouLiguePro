import { Category, Conference } from "@prisma/client";

export const CONFERENCES: Conference[] = ["SUD", "NORD"];
export const CATEGORIES: Category[] = ["HOMMES", "DAMES"];

export const CONFERENCE_LABELS: Record<Conference, string> = {
  SUD: "Sud",
  NORD: "Nord",
};

export const CATEGORY_LABELS: Record<Category, string> = {
  HOMMES: "Hommes",
  DAMES: "Dames",
};
