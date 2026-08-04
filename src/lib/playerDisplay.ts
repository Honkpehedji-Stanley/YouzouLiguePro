export function getDisplayAge(player: { birthDate: Date | null; age: number | null }) {
  if (player.birthDate) {
    const diff = Date.now() - player.birthDate.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }
  return player.age ?? null;
}

export function formatBirthDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}
