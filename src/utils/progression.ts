export interface ProgressionRecommendation {
  shouldIncrease: boolean;
  recommendedWeightKg: number;
  reason: string;
}

export function calculateProgression(
  targetRepMax: number,
  previousSets?: { weightKg: number; reps: number }[],
  weightIncrement: number = 2.5
): ProgressionRecommendation | null {
  if (!previousSets || previousSets.length === 0) return null;

  const maxWeight = Math.max(...previousSets.map((s) => s.weightKg));
  if (maxWeight <= 0) return null;

  // Check if all previous sets hit or exceeded targetRepMax
  const allMaxHit = previousSets.every((s) => s.reps >= targetRepMax);

  if (allMaxHit) {
    const nextWeight = maxWeight + weightIncrement;
    return {
      shouldIncrease: true,
      recommendedWeightKg: nextWeight,
      reason: `Hit ${targetRepMax} reps on all sets last time. Try ${nextWeight} kg (+${weightIncrement} kg).`,
    };
  }

  return {
    shouldIncrease: false,
    recommendedWeightKg: maxWeight,
    reason: `Maintain ${maxWeight} kg until hitting ${targetRepMax} reps on all sets.`,
  };
}
