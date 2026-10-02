/**
 * Target Chase Engine: Dynamic 3 to 4 Level Budget Allocation
 * 
 * Rules:
 * 1. Minimum 3 Levels, Maximum 4 Levels.
 * 2. Entire wallet amount is divided so the sum of all levels = 100% of the wallet.
 * 3. On WIN: As profit accumulates, the new wallet balance compounds and Level 1 bet
 *    dynamically increases (bet amount badhta jayega), speeding up target achievement.
 * 4. On LOSS: Ladder remains strictly fixed at the previously calculated levels (L1, L2, L3, L4).
 */

export function computeTargetLevels(wallet: number, levelCount: 3 | 4 = 4): number[] {
  const safeWallet = Math.max(10, Math.round(wallet));

  if (levelCount === 3) {
    // 3-Level Allocation: 10% / 25% / 65% (Sum = exactly 100% of wallet)
    const l1 = Math.max(1, Math.round(safeWallet * 0.10));
    const l2 = Math.max(l1 + 1, Math.round(safeWallet * 0.25));
    const l3 = Math.max(l2 + 1, safeWallet - (l1 + l2));
    return [l1, l2, l3];
  } else {
    // 4-Level Allocation: 5% / 11% / 25% / 59% (Sum = exactly 100% of wallet)
    const l1 = Math.max(1, Math.round(safeWallet * 0.05));
    const l2 = Math.max(l1 + 1, Math.round(safeWallet * 0.11));
    const l3 = Math.max(l2 + 1, Math.round(safeWallet * 0.25));
    const l4 = Math.max(l3 + 1, safeWallet - (l1 + l2 + l3));
    return [l1, l2, l3, l4];
  }
}
