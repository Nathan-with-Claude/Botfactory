/**
 * index.ts — Barrel du Design System DocuPost (Web)
 *
 * Point d'entrée unique pour importer tous les composants du design system.
 *
 * Usage :
 *   import { BadgeStatut, BoutonCTA, CarteColis } from '../components/design-system';
 *
 * US-025 : Design System DocuPost.
 */

// ─── Composants de base ────────────────────────────────────────────────────
export { BadgeStatut } from './BadgeStatut';
export type { BadgeStatutProps, BadgeVariant, BadgeSize } from './BadgeStatut';

export { BoutonCTA } from './BoutonCTA';
export type { BoutonCTAProps, BoutonVariant, BoutonSize } from './BoutonCTA';

export { ChipContrainte } from './ChipContrainte';
export type { ChipContrainteProps, TypeContrainte } from './ChipContrainte';

export { IndicateurSync } from './IndicateurSync';
export type { IndicateurSyncProps, SyncStatus } from './IndicateurSync';

// ─── Composants composites ─────────────────────────────────────────────────
export { BandeauProgression } from './BandeauProgression';
export type { BandeauProgressionProps, StatutProgression } from './BandeauProgression';

export { CarteColis } from './CarteColis';
export type { CarteColisProps, StatutColisVue } from './CarteColis';

export { BandeauInstruction } from './BandeauInstruction';
export type { BandeauInstructionProps } from './BandeauInstruction';

export { DrawerDetail } from './DrawerDetail';
export type { DrawerDetailProps } from './DrawerDetail';

// ─── Sélecteurs ────────────────────────────────────────────────────────────
export { CardTypeInstruction } from './CardTypeInstruction';
export type { CardTypeInstructionProps, TypeInstruction } from './CardTypeInstruction';

export { CardTypePreuve } from './CardTypePreuve';
export type { CardTypePreuveProps, TypePreuve } from './CardTypePreuve';
