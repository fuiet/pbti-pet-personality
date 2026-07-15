export function canAccessPremium(_isPremium: boolean) {
  return true;
}

export function unlockPremium() {
  return {
    isPremium: true,
  };
}
