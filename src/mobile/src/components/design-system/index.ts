/**
 * index.ts — Barrel du Design System DocuPost (Mobile / React Native)
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

// ─── Sélecteurs ────────────────────────────────────────────────────────────
export { CardTypePreuve } from './CardTypePreuve';
export type { CardTypePreuveProps, TypePreuve } from './CardTypePreuve';

// ─── Composants DC — US-031 (retour designer externe 2026-03-25) ───────────
// DC-01 : Dégradé identitaire DocuPost (logo, header)
export { TacticalGradient } from './TacticalGradient';
export type { TacticalGradientProps } from './TacticalGradient';

// DC-02 : Footer fixe translucide (M-02, M-03, M-04, M-05)
export { GlassEffectFooter } from './GlassEffectFooter';
export type { GlassEffectFooterProps } from './GlassEffectFooter';

// DC-03 : Fond grille de points pour pad de signature (M-04)
export { SignatureGrid } from './SignatureGrid';
export type { SignatureGridProps } from './SignatureGrid';

// DC-04 : Bannière contextuelle colis en cours (M-04, M-05)
export { ContextBannerColis } from './ContextBannerColis';
export type { ContextBannerColisProps, ContextBannerVariant } from './ContextBannerColis';

// DC-07 : Barre de progression fine 4px (M-04)
export { MiniProgressBar } from './MiniProgressBar';
export type { MiniProgressBarProps } from './MiniProgressBar';

// TODO post-MVP : DC-05 BadgePrioriteHaute (M-06 — nice to have)
// TODO post-MVP : DC-06 ImageContextuelle (M-03 — données non disponibles en prod)
// TODO post-MVP : DC-08 CardImageAccueil (écran PRD — hors périmètre MVP)
