interface NeuralOscillationChartProps {
  chunkHistory: number[];
}

export function NeuralOscillationChart({ chunkHistory }: NeuralOscillationChartProps) {
  // Fixed max value: 5 messages per 5 seconds = 100% height
  const maxChunks = 5;

  return (
    <div className="activity-section chart-section">
      <div className="section-label">NEURAL OSCILLATION</div>
      <div className="bars-wrapper">
        {chunkHistory.map((count, idx) => (
          <div
            key={idx}
            className="bar"
            style={{
              height: `${Math.min((count / maxChunks) * 100, 100)}%`,
              opacity: count > 0 ? 1 : 0.3,
            }}
          />
        ))}
      </div>
      <div className="chart-label">5 Minutes (5s intervals)</div>
    </div>
  );
}
