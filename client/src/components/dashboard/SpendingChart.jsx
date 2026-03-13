import React, { useEffect, useRef } from 'react'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const COLORS = ['#22d3a5', '#5b8def', '#f5c842', '#f06a6a', '#c084fc', '#fb923c', '#6b7685']

export default function SpendingChart({ data }) {
  const ref = useRef(null)
  const instance = useRef(null)

  useEffect(() => {
    if (!ref.current || !data?.length) return
    if (instance.current) instance.current.destroy()

    instance.current = new Chart(ref.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: COLORS.slice(0, data.length),
          borderWidth: 0,
          hoverOffset: 8,
        }],
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: 'var(--text2, #6b7685)', font: { family: 'Plus Jakarta Sans' }, padding: 16 },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    })

    return () => instance.current?.destroy()
  }, [data])

  return <div className="chart-wrap"><canvas ref={ref} /></div>
}
