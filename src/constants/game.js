export const GAME_STATS = {
  BASE_WIDTH: 1280,
  BASE_HEIGHT: 720,
  GRAVITY: 2250,
}

export const PLAYER_STATS = {
  ATTACK_STARTUP: 100, // ms
  ATTACK_DURATION: 100, // ms
  ATTACK_ENDLAG: 300, // ms
  ATTACK_KB_DURATION: 150, // ms
  ATTACK_HITLAG: 150, // ms
}

export const GAME_COLORS = {
  PLAYER_ONE: 0x66ccff, // Bleu
  PLAYER_TWO: 0xff6666, // Rouge
  HITBOX: 0xffff00, // Jaune
  GROUND: 0x072842, // Gris
}

export const COMBAT_STATS = {
  COMBO_WINDOW: 1500,    // Temps (ms) pour porter le coup suivant avant reset
  MAX_COMBO: 5,          // Limite optionnelle pour éviter d'envoyer l'autre sur Mars
}