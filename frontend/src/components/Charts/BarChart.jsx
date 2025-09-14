import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title as ChartTitle, Tooltip, Legend } from "chart.js"
import { Card, Spin } from "antd"

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend)

const BarChart = ({ data, title, height = 400, loading = false }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false, // Let Ant Design Card handle the title
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <Card 
      title={title} 
      className="eco-card"
      bodyStyle={{ height: `${height}px`, padding: '20px' }}
    >
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%' 
        }}>
          <Spin size="large" tip="Cargando gráfico..." />
        </div>
      ) : (
        <div style={{ height: '100%' }}>
          <Bar data={data} options={options} />
        </div>
      )}
    </Card>
  )
}

export default BarChart
