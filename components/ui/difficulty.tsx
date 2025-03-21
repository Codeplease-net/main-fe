// Simplified difficulty levels for 500-3500 range
const difficultyLevels = [
  { point: 500, color: "#22c55e" },   // Green (500-1500)
  { point: 1500, color: "#eab308" },  // Yellow (1500-2500)
  { point: 2500, color: "#f97316" },  // Orange (2500-3000)
  { point: 3000, color: "#ef4444" },  // Red (3000-3500)
];

function getDifficultyColor(difficulty: number): string {
  // Ensure difficulty is between 500 and 3500
  const normalizedDifficulty = Math.max(500, Math.min(3500, difficulty));
  
  for (let i = difficultyLevels.length - 1; i >= 0; i--) {
    if (normalizedDifficulty >= difficultyLevels[i].point) {
      return difficultyLevels[i].color;
    }
  }
  
  return difficultyLevels[0].color;
}

export default function DifficultyBox({ difficulty }: { difficulty: number | null }) {
  // Default to 500 if difficulty is null
  const difficultyValue = difficulty ?? 500;
  const color = getDifficultyColor(difficultyValue);
  
  return (
    <div
      style={{ backgroundColor: color }}
      className="px-2.5 py-1 rounded-md text-white text-xs font-medium min-w-[55px] text-center"
    >
      {difficultyValue}
    </div>
  );
}