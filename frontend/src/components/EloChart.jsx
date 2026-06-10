import { useEffect, useRef } from 'react'
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export default function EloChart({ elo_distribution }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !elo_distribution) return

    const labels = elo_distribution.map(({ min, max }) =>
      max >= 9999 ? `${min}+` : `${min}–${max}`
    )
    const data = elo_distribution.map((b) => b.players)

    if (chartRef.current) chartRef.current.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [{
          data,
          borderColor: "#ff2d78",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#ff2d78",
          pointBorderColor: "#151c26",
          pointBorderWidth: 2,
          tension: 0.4,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#0d1117",
            borderColor: "#1e2a38",
            borderWidth: 1,
            titleColor: "#555f6e",
            bodyColor: "#e0e0e0",
            padding: 10,
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y} players`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "#1e2a38" },
            ticks: { color: "#555f6e", font: { size: 11, family: "Inter" } },
            border: { display: false },
          },
          y: {
            grid: { color: "#1e2a38" },
            ticks: { color: "#555f6e", font: { size: 11, family: "Inter" } },
            border: { display: false },
            beginAtZero: true,
          },
        },
      },
    })

    return () => chartRef.current?.destroy()
  }, [elo_distribution])

  return (
    <div className="chart-wrapper">
      <canvas ref={canvasRef} />
    </div>
  )
}