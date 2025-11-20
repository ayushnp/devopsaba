from flask import Flask, jsonify, render_template_string
import psutil
from datetime import datetime

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>System Monitor Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- Bootstrap -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

  <!-- Google Font -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">

  <style>
    body {
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #e2e8f0;
      font-family: 'Poppins', sans-serif;
    }

    .dashboard-title {
      font-size: 2rem;
      font-weight: 600;
      color: #38bdf8;
      text-shadow: 0 0 8px rgba(56,189,248,0.6);
    }

    .card-glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.08);
      transition: 0.3s;
    }
    .card-glass:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: #38bdf8;
    }

    .small-muted {
      color: #9ca3af;
      font-size: .85rem;
    }

    canvas {
      padding: 5px;
    }
  </style>
</head>

<body>
<div class="container py-4">

  <div class="d-flex justify-content-between align-items-center mb-4">
    <div class="dashboard-title">⚡ Real-Time System Monitor</div>
    <div class="small-muted">Updated: <span id="last-update">--</span></div>
  </div>

  <div class="row g-4">

    <!-- CPU -->
    <div class="col-md-6">
      <div class="card-glass">
        <div class="d-flex justify-content-between">
          <div>
            <div class="small-muted">CPU Usage</div>
            <div id="cpu-text" class="metric-value">--%</div>
            <div class="small-muted" id="cpu-cores">Cores: --</div>
            <div class="small-muted" id="percore">--</div>
          </div>
          <div style="width: 55%;">
            <canvas id="cpuChart" height="140"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Memory -->
    <div class="col-md-6">
      <div class="card-glass">
        <div class="d-flex justify-content-between">
          <div>
            <div class="small-muted">Memory Usage</div>
            <div id="mem-text" class="metric-value">--%</div>
            <div class="small-muted" id="mem-details">Used: -- / --</div>
          </div>
          <div style="width: 55%;">
            <canvas id="memChart" height="140"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Disk -->
    <div class="col-md-6">
      <div class="card-glass">
        <div class="small-muted mb-2">Disk Usage</div>
        <div class="d-flex align-items-center">
          <div style="width: 50%;">
            <canvas id="diskChart" height="140"></canvas>
          </div>
          <div class="ps-3">
            <div id="disk-text" class="metric-value">--%</div>
            <div class="small-muted" id="disk-details">--</div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="text-center small-muted mt-4">
    Chart refresh = 1 second · Tracks last 60 seconds
  </div>

</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>

const SAMPLE_COUNT = 60;

function createLineChart(ctx, color) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: Array(SAMPLE_COUNT).fill(""),
      datasets: [{
        data: Array(SAMPLE_COUNT).fill(null),
        borderColor: color,
        backgroundColor: color + "33",
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + "%" } },
        x: { display: false }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function createDoughnutChart(ctx) {
  return new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Used", "Free"],
      datasets: [{
        data: [0, 100],
        backgroundColor: ["#ef4444", "#22c55e"]
      }]
    },
    options: {
      animation: false,
      plugins: { legend: { labels: { color: "white" } } }
    }
  });
}

const cpuChart = createLineChart(cpuChartCtx = document.getElementById("cpuChart"), "#38bdf8");
const memChart = createLineChart(memChartCtx = document.getElementById("memChart"), "#a78bfa");
const diskChart = createDoughnutChart(document.getElementById("diskChart"));

function updateChart(chart, value) {
  chart.data.datasets[0].data.push(value);
  if (chart.data.datasets[0].data.length > SAMPLE_COUNT)
      chart.data.datasets[0].data.shift();
  chart.update("none");
}

async function updateMetrics() {
  const res = await fetch("/metrics");
  const d = await res.json();

  document.getElementById("last-update").innerText = d.timestamp;

  // CPU
  document.getElementById("cpu-text").innerText = d.cpu.percent.toFixed(1) + "%";
  document.getElementById("cpu-cores").innerText = "Cores: " + d.cpu.cores;
  document.getElementById("percore").innerText = d.cpu.percore.map(x => x.toFixed(1)).join(" • ");
  updateChart(cpuChart, d.cpu.percent);

  // Memory
  document.getElementById("mem-text").innerText = d.mem.percent.toFixed(1) + "%";
  document.getElementById("mem-details").innerText = d.mem.used_human + " / " + d.mem.total_human;
  updateChart(memChart, d.mem.percent);

  // Disk
  diskChart.data.datasets[0].data = [d.disk.percent, 100 - d.disk.percent];
  diskChart.update("none");
  document.getElementById("disk-text").innerText = d.disk.percent.toFixed(1) + "%";
  document.getElementById("disk-details").innerText = d.disk.used_human + " / " + d.disk.total_human;
}

setInterval(updateMetrics, 1000);
updateMetrics();

</script>
</body>
</html>
"""

def bytes2human(n):
    symbols = ["B","KB","MB","GB","TB","PB"]
    for i, s in enumerate(symbols):
        step = 1 << (i * 10)
        if n >= step:
            return f"{n / step:.2f} {s}"
    return f"{n} B"

@app.route("/")
def index():
    return render_template_string(TEMPLATE)

@app.route("/metrics")
def metrics():
    return jsonify({
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "cpu": {
            "percent": psutil.cpu_percent(interval=None),
            "percore": psutil.cpu_percent(interval=None, percpu=True),
            "cores": psutil.cpu_count()
        },
        "mem": {
            "percent": psutil.virtual_memory().percent,
            "used_human": bytes2human(psutil.virtual_memory().used),
            "total_human": bytes2human(psutil.virtual_memory().total)
        },
        "disk": {
            "percent": psutil.disk_usage('/').percent,
            "used_human": bytes2human(psutil.disk_usage('/').used),
            "total_human": bytes2human(psutil.disk_usage('/').total)
        }
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
