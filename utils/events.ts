
// Event Bus for Global Juice & VFX
export type VisualEffectType = 'MERGE_EXPLOSION' | 'GOLD_RAIN' | 'CONFETTI' | 'TEXT_POPUP' | 'DRAG_TRAIL' | 'SHOCKWAVE' | 'SCREEN_SHAKE';

export interface EffectPayload {
  x?: number;
  y?: number;
  text?: string;
  color?: string;
  count?: number;
  intensity?: number; // For shake
}

export const triggerVisualEffect = (type: VisualEffectType, payload: EffectPayload = {}) => {
  const event = new CustomEvent('rmk-visual-effect', {
    detail: { type, ...payload }
  });
  window.dispatchEvent(event);
};
