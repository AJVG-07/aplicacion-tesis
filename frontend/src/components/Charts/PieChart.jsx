"use client"

import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"

ChartJS.register(ArcElement, Tooltip, Legend)

const PieChart = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Pie data={data} options={options} />
    </div>
  )
}

export default PieChart
