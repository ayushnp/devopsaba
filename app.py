from flask import Flask, jsonify, render_template_string
import psutil
from datetime import datetime

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Real-Time System Monitor</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background: #0f172a; color: #e6eef8; }
    .card { background: rgba(255,255,255,0.04); border: none; }
    .metric { font-weight: 700; font-size: 1.25rem; }
    canvas { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 10px; }
    .small-muted { color: #9fb0d6; font-size: .85rem; }
  </style>
</head>
<body>
<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3>Real-Time System Monitor</h3>
    <div class="small-muted">Last update: <span id="last-update">-</span></div>
  </div>

  <div class="row g-3">
    <div class="col-md-6">
      <div class="card p-3">
        <div class="d-flex justify-content-between">
          <div>
            <div class="small-muted">CPU Usage</div>
            <div id="cpu-text" class="metric">--%</div>
            <div class="small-muted" id="cpu-cores">Cores: --</div>
          </div>
          <div style="width: 45%;">
            <canvas id="cpuChart" height="140"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card p-3">
        <div class="d-flex justify-content-between">
          <div>
            <div class="small-muted">Memory Usage</div>
            <div id="mem-text" class="metric">--%</div>
            <div class="small-muted" id="mem-details">Used: -- / --</div>
          </div>
          <div style="width: 45%;">
            <canvas id="memChart" height="140"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card p-3">
        <div class="small-muted mb-2">Disk Usage</div>
        <div class="d-flex align-items-center">
          <div style="width: 60%;">
            <canvas id="diskChart" height="140"></canvas>
          </div>
          <div class="ps-3">
            <div id="disk-text" class="metric">--% used</div>
            <div class="small-muted" id="disk-details">Used: -- / --</div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card p-3">
        <div class="small-muted mb-2">Per-core CPU</div>
        <div id="percore" class="small-muted">--</div>
      </div>
    </div>
  </div>

  <footer class="mt-4 small-muted">Auto-refresh every 1s</footer>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
const SAMPLE_COUNT = 60;

function makeLineChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(SAMPLE_COUNT).fill(''),
      datasets: [{
        data: Array(SAMPLE_COUNT).fill(null),
        tension: 0.25,
        fill: true,
        borderWidth: 1,
        pointRadius: 0
      }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100, ticks: { callback: v => v + '%' } },
        x: { display: false }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function makeDoughnutChart(ctx) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Used', 'Free'],
      datasets: [{ data: [0, 100], borderWidth: 0 }]
    },
    options: {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

const cpuChart = makeLineChart(document.getElementById('cpuChart'));
const memChart = makeLineChart(document.getElementById('memChart'));
const diskChart = makeDoughnutChart(document.getElementById('diskChart'));

function pushData(chart, value) {
  chart.data.datasets[0].data.push(value);
  if (chart.data.datasets[0].data.length > SAMPLE_COUNT) chart.data.datasets[0].data.shift();
  chart.update('none');
}

async function fetchAndUpdate() {
  const res = await fetch('/metrics');
  const data = await res.json();

  document.getElementById('last-update').innerText = data.timestamp;

  // CPU
  document.getElementById('cpu-text').innerText = data.cpu.percent.toFixed(1) + "%";
  document.getElementById('cpu-cores').innerText = "Cores: " + data.cpu.cores;
  document.getElementById('percore').innerText = data.cpu.percore.map(x => x.toFixed(1) + "%").join(" | ");
  pushData(cpuChart, data.cpu.percent);

  // Memory
  document.getElementById('mem-text').innerText = data.mem.percent.toFixed(1) + "%";
  document.getElementById('mem-details').innerText = `Used: ${data.mem.used_human} / ${data.mem.total_human}`;
  pushData(memChart, data.mem.percent);

  // Disk
  document.getElementById('disk-text').innerText = data.disk.percent.toFixed(1) + "% used";
  document.getElementById('disk-details').innerText = `Used: ${data.disk.used_human} / ${data.disk.total_human}`;
  diskChart.data.datasets[0].data = [data.disk.percent, 100 - data.disk.percent];
  diskChart.update('none');
}

setInterval(fetchAndUpdate, 1000);
fetchAndUpdate();
</script>
</body>
</html>
"""

def bytes2human(n):
    symbols = ('B','KB','MB','GB','TB','PB')
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
    cpu_percent = psutil.cpu_percent(interval=None)
    per_core = psutil.cpu_percent(interval=None, percpu=True)
    cores = psutil.cpu_count()

    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    return jsonify({
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "cpu": {
            "percent": cpu_percent,
            "percore": per_core,
            "cores": cores
        },
        "mem": {
            "percent": mem.percent,
            "used_human": bytes2human(mem.used),
            "total_human": bytes2human(mem.total)
        },
        "disk": {
            "percent": disk.percent,
            "used_human": bytes2human(disk.used),
            "total_human": bytes2human(disk.total)
        }
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
