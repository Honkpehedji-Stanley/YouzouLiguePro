// Données de référence pour les formulaires admin : nationalités (démonymes français)
// et communes du Bénin, afin d'éviter la saisie libre et les fautes de frappe.

export type Nationality = {
  value: string;
  country: string;
  isBenin?: boolean;
};

export const NATIONALITIES: Nationality[] = [
  { value: "Béninois(e)", country: "Bénin", isBenin: true },

  // Afrique de l'Ouest
  { value: "Togolais(e)", country: "Togo" },
  { value: "Nigérian(e)", country: "Nigeria" },
  { value: "Ghanéen(ne)", country: "Ghana" },
  { value: "Nigérien(ne)", country: "Niger" },
  { value: "Burkinabè", country: "Burkina Faso" },
  { value: "Ivoirien(ne)", country: "Côte d'Ivoire" },
  { value: "Sénégalais(e)", country: "Sénégal" },
  { value: "Malien(ne)", country: "Mali" },
  { value: "Guinéen(ne)", country: "Guinée" },
  { value: "Guinéen(ne) (Bissau)", country: "Guinée-Bissau" },
  { value: "Gambien(ne)", country: "Gambie" },
  { value: "Sierra-léonais(e)", country: "Sierra Leone" },
  { value: "Libérien(ne)", country: "Liberia" },
  { value: "Cap-verdien(ne)", country: "Cap-Vert" },
  { value: "Mauritanien(ne)", country: "Mauritanie" },

  // Afrique centrale
  { value: "Camerounais(e)", country: "Cameroun" },
  { value: "Gabonais(e)", country: "Gabon" },
  { value: "Congolais(e) (RDC)", country: "RD Congo" },
  { value: "Congolais(e) (Congo-Brazzaville)", country: "Congo" },
  { value: "Tchadien(ne)", country: "Tchad" },
  { value: "Centrafricain(e)", country: "République centrafricaine" },
  { value: "Équato-guinéen(ne)", country: "Guinée équatoriale" },

  // Afrique du Nord
  { value: "Marocain(e)", country: "Maroc" },
  { value: "Algérien(ne)", country: "Algérie" },
  { value: "Tunisien(ne)", country: "Tunisie" },
  { value: "Égyptien(ne)", country: "Égypte" },
  { value: "Libyen(ne)", country: "Libye" },
  { value: "Soudanais(e)", country: "Soudan" },

  // Afrique de l'Est et australe
  { value: "Éthiopien(ne)", country: "Éthiopie" },
  { value: "Kényan(e)", country: "Kenya" },
  { value: "Tanzanien(ne)", country: "Tanzanie" },
  { value: "Ougandais(e)", country: "Ouganda" },
  { value: "Rwandais(e)", country: "Rwanda" },
  { value: "Burundais(e)", country: "Burundi" },
  { value: "Zambien(ne)", country: "Zambie" },
  { value: "Zimbabwéen(ne)", country: "Zimbabwe" },
  { value: "Mozambicain(e)", country: "Mozambique" },
  { value: "Angolais(e)", country: "Angola" },
  { value: "Namibien(ne)", country: "Namibie" },
  { value: "Sud-Africain(e)", country: "Afrique du Sud" },
  { value: "Botswanais(e)", country: "Botswana" },

  // Reste du monde (joueurs/staff importés)
  { value: "Français(e)", country: "France" },
  { value: "Américain(e)", country: "États-Unis" },
  { value: "Canadien(ne)", country: "Canada" },
  { value: "Belge", country: "Belgique" },
  { value: "Espagnol(e)", country: "Espagne" },
  { value: "Portugais(e)", country: "Portugal" },
  { value: "Italien(ne)", country: "Italie" },
  { value: "Allemand(e)", country: "Allemagne" },
  { value: "Brésilien(ne)", country: "Brésil" },
  { value: "Serbe", country: "Serbie" },
  { value: "Lituanien(ne)", country: "Lituanie" },
  { value: "Chinois(e)", country: "Chine" },
  { value: "Libanais(e)", country: "Liban" },
  { value: "Turc(que)", country: "Turquie" },
  { value: "Australien(ne)", country: "Australie" },
];

export const BENIN_COMMUNES_BY_DEPARTMENT: Record<string, string[]> = {
  Alibori: ["Banikoara", "Gogounou", "Kandi", "Karimama", "Malanville", "Ségbana"],
  Atacora: [
    "Boukoumbé",
    "Cobly",
    "Kérou",
    "Kouandé",
    "Matéri",
    "Natitingou",
    "Péhunco",
    "Tanguiéta",
    "Toucountouna",
  ],
  Atlantique: [
    "Abomey-Calavi",
    "Allada",
    "Kpomassè",
    "Ouidah",
    "Sô-Ava",
    "Toffo",
    "Tori-Bossito",
    "Zè",
  ],
  Borgou: ["Bembéréké", "Kalalé", "N'Dali", "Nikki", "Parakou", "Pèrèrè", "Sinendé", "Tchaourou"],
  Collines: ["Bantè", "Dassa-Zoumè", "Glazoué", "Ouèssè", "Savalou", "Savè"],
  Couffo: ["Aplahoué", "Djakotomey", "Dogbo", "Klouékanmè", "Lalo", "Toviklin"],
  Donga: ["Bassila", "Copargo", "Djougou", "Ouaké"],
  Littoral: ["Cotonou"],
  Mono: ["Athiémé", "Bopa", "Comé", "Grand-Popo", "Houéyogbé", "Lokossa"],
  Ouémé: [
    "Adjarra",
    "Adjohoun",
    "Aguégués",
    "Akpro-Missérété",
    "Avrankou",
    "Bonou",
    "Dangbo",
    "Porto-Novo",
    "Sèmè-Kpodji",
  ],
  Plateau: ["Adja-Ouèrè", "Ifangni", "Kétou", "Pobè", "Sakété"],
  Zou: ["Abomey", "Agbangnizoun", "Bohicon", "Covè", "Djidja", "Ouinhi", "Za-Kpota", "Zagnanado", "Zogbodomey"],
};

export function isBeninNationality(nationality: string | null | undefined): boolean {
  if (!nationality) return false;
  const entry = NATIONALITIES.find((n) => n.value === nationality);
  return entry?.isBenin ?? nationality.startsWith("Béninois");
}
