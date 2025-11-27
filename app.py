from flask import Flask, jsonify, render_template_string
import psutil
from datetime import datetime, timedelta

app = Flask(__name__)

TEMPLATE = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Advanced System Monitor</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { 
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
      color: #e6eef8; 
      min-height: 100vh;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .card { 
      background: rgba(255,255,255,0.06); 
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    }
    .metric { font-weight: 700; font-size: 1.4rem; color: #60a5fa; }
    .metric-large { font-size: 2rem; }
    canvas { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 10px; }
    .small-muted { color: #9fb0d6; font-size: .85rem; }
    .badge-custom { 
      background: rgba(96, 165, 250, 0.2); 
      color: #60a5fa; 
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 8px;
      animation: pulse 2s infinite;
    }
    .status-good { background: #34d399; }
    .status-warning { background: #fbbf24; }
    .status-critical { background: #ef4444; }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .header-gradient {
      background: linear-gradient(90deg, #60a5fa, #34d399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .process-row {
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 6px;
      font-size: 0.9rem;
    }
    .process-row:hover {
      background: rgba(255,255,255,0.06);
    }
    .chart-container {
      position: relative;
      height: 160px;
    }
  </style>
</head>
<body>
<div class="container-fluid py-4">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h2 class="header-gradient mb-1">HEllo AYUSH</h2>
      <div class="small-muted">
        <span id="status-indicator" class="status-dot status-good"></span>
        Monitoring active · Updated: <span id="last-update">-</span>
      </div>
    </div>
    <div class="text-end">
      <div class="small-muted">System Uptime</div>
      <div class="metric" id="uptime">--</div>
    </div>
  </div>

  <!-- System Overview Cards -->
  <div class="row g-3 mb-3">
    <div class="col-lg-3 col-md-6">
      <div class="card p-3 text-center">
        <div class="small-muted">CPU Usage</div>
        <div id="cpu-text" class="metric metric-large">--%</div>
        <div class="small-muted">
          <span id="cpu-cores">-- cores</span> · 
          <span id="cpu-freq">-- GHz</span>
        </div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6">
      <div class="card p-3 text-center">
        <div class="small-muted">Memory Usage</div>
        <div id="mem-text" class="metric metric-large">--%</div>
        <div class="small-muted" id="mem-details">-- / --</div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6">
      <div class="card p-3 text-center">
        <div class="small-muted">Disk Usage</div>
        <div id="disk-text" class="metric metric-large">--%</div>
        <div class="small-muted" id="disk-details">-- / --</div>
      </div>
    </div>
    <div class="col-lg-3 col-md-6">
      <div class="card p-3 text-center">
        <div class="small-muted">Network</div>
        <div class="metric" style="font-size: 1rem;">
          <div>↓ <span id="net-down" style="color: #34d399;">--</span></div>
          <div>↑ <span id="net-up" style="color: #60a5fa;">--</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts Row -->
  <div class="row g-3 mb-3">
    <div class="col-lg-4">
      <div class="card p-3">
        <div class="small-muted mb-2">CPU History (60s)</div>
        <div class="chart-container">
          <canvas id="cpuChart"></canvas>
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="card p-3">
        <div class="small-muted mb-2">Memory History (60s)</div>
        <div class="chart-container">
          <canvas id="memChart"></canvas>
        </div>
      </div>
    </div>
    <div class="col-lg-4">
      <div class="card p-3">
        <div class="small-muted mb-2">Network Activity (60s)</div>
        <div class="chart-container">
          <canvas id="netChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Per-core and Temperature -->
  <div class="row g-3 mb-3">
    <div class="col-lg-6">
      <div class="card p-3">
        <div class="small-muted mb-2">Per-Core CPU Usage</div>
        <div id="percore-container"></div>
      </div>
    </div>
    <div class="col-lg-6">
      <div class="card p-3">
        <div class="small-muted mb-2">System Information</div>
        <div class="row g-2 mt-1">
          <div class="col-6">
            <span class="badge-custom">Platform</span>
            <div id="platform" class="mt-1">--</div>
          </div>
          <div class="col-6">
            <span class="badge-custom">Boot Time</span>
            <div id="boot-time" class="mt-1">--</div>
          </div>
          <div class="col-6 mt-2">
            <span class="badge-custom">Processes</span>
            <div id="proc-count" class="mt-1">--</div>
          </div>
          <div class="col-6 mt-2">
            <span class="badge-custom">Temperature</span>
            <div id="temp" class="mt-1">--</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Top Processes -->
  <div class="row g-3">
    <div class="col-12">
      <div class="card p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="small-muted">Top Processes by CPU</div>
          <span class="badge-custom" id="proc-badge">Refreshing...</span>
        </div>
        <div id="processes"></div>
      </div>
    </div>
  </div>

  <footer class="mt-4 text-center small-muted pb-3">
    Real-time monitoring with 1-second refresh interval
  </footer>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
const SAMPLE_COUNT = 60;
let lastNetRx = 0, lastNetTx = 0;

const chartConfig = {
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false }
  }
};

function makeLineChart(ctx, label, color, showY = true) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(SAMPLE_COUNT).fill(''),
      datasets: [{
        label: label,
        data: Array(SAMPLE_COUNT).fill(null),
        tension: 0.3,
        fill: true,
        backgroundColor: color + '33',
        borderColor: color,
        borderWidth: 2,
        pointRadius: 0,
      }]
    },
    options: {
      ...chartConfig,
      scales: {
        y: { 
          display: showY,
          min: 0, 
          max: 100, 
          ticks: { color: '#9fb0d6', callback: v => v + '%' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { display: false }
      }
    }
  });
}

function makeNetChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(SAMPLE_COUNT).fill(''),
      datasets: [
        {
          label: 'Download',
          data: Array(SAMPLE_COUNT).fill(null),
          tension: 0.3,
          fill: true,
          backgroundColor: '#34d39933',
          borderColor: '#34d399',
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'Upload',
          data: Array(SAMPLE_COUNT).fill(null),
          tension: 0.3,
          fill: true,
          backgroundColor: '#60a5fa33',
          borderColor: '#60a5fa',
          borderWidth: 2,
          pointRadius: 0,
        }
      ]
    },
    options: {
      ...chartConfig,
      scales: {
        y: { 
          display: true,
          min: 0,
          ticks: { color: '#9fb0d6', callback: v => v.toFixed(1) + ' MB/s' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { display: false }
      },
      plugins: {
        legend: { display: true, position: 'top', labels: { color: '#dbeafe' } },
        tooltip: { mode: 'index', intersect: false }
      }
    }
  });
}

const cpuChart = makeLineChart(document.getElementById('cpuChart').getContext('2d'), 'CPU %', '#60a5fa');
const memChart = makeLineChart(document.getElementById('memChart').getContext('2d'), 'Memory %', '#34d399');
const netChart = makeNetChart(document.getElementById('netChart').getContext('2d'));

function pushData(chart, value, datasetIndex = 0) {
  chart.data.datasets[datasetIndex].data.push(value);
  if (chart.data.datasets[datasetIndex].data.length > SAMPLE_COUNT) {
    chart.data.datasets[datasetIndex].data.shift();
  }
  const now = new Date().toLocaleTimeString();
  if (datasetIndex === 0) {
    chart.data.labels.push(now);
    if (chart.data.labels.length > SAMPLE_COUNT) chart.data.labels.shift();
  }
  chart.update('none');
}

function updateStatusIndicator(cpu, mem) {
  const indicator = document.getElementById('status-indicator');
  if (cpu > 80 || mem > 90) {
    indicator.className = 'status-dot status-critical';
  } else if (cpu > 60 || mem > 75) {
    indicator.className = 'status-dot status-warning';
  } else {
    indicator.className = 'status-dot status-good';
  }
}

async function fetchAndUpdate() {
  try {
    const res = await fetch('/metrics');
    const json = await res.json();
    
    document.getElementById('last-update').innerText = json.timestamp;
    document.getElementById('uptime').innerText = json.uptime;

    // CPU
    const cpu = json.cpu.percent;
    document.getElementById('cpu-text').innerText = cpu.toFixed(1) + '%';
    document.getElementById('cpu-cores').innerText = json.cpu.cores + ' cores';
    document.getElementById('cpu-freq').innerText = json.cpu.freq;
    pushData(cpuChart, cpu);

    // Per-core visualization
    const percoreHtml = json.cpu.percore.map((p, i) => {
      const width = p;
      const color = p > 80 ? '#ef4444' : p > 60 ? '#fbbf24' : '#34d399';
      return `
        <div class="d-flex align-items-center mb-2">
          <div style="width: 60px;" class="small-muted">Core ${i}</div>
          <div style="flex: 1; background: rgba(255,255,255,0.1); height: 20px; border-radius: 4px; overflow: hidden;">
            <div style="width: ${width}%; height: 100%; background: ${color}; transition: width 0.3s;"></div>
          </div>
          <div style="width: 50px; text-align: right;" class="small-muted">${p.toFixed(1)}%</div>
        </div>
      `;
    }).join('');
    document.getElementById('percore-container').innerHTML = percoreHtml;

    // Memory
    const mem = json.mem.percent;
    document.getElementById('mem-text').innerText = mem.toFixed(1) + '%';
    document.getElementById('mem-details').innerText = `${json.mem.used_human} / ${json.mem.total_human}`;
    pushData(memChart, mem);

    // Disk
    document.getElementById('disk-text').innerText = json.disk.percent.toFixed(1) + '%';
    document.getElementById('disk-details').innerText = `${json.disk.used_human} / ${json.disk.total_human}`;

    // Network
    const netRx = json.network.bytes_recv;
    const netTx = json.network.bytes_sent;
    
    if (lastNetRx > 0) {
      const rxRate = ((netRx - lastNetRx) / 1024 / 1024).toFixed(2);
      const txRate = ((netTx - lastNetTx) / 1024 / 1024).toFixed(2);
      document.getElementById('net-down').innerText = rxRate + ' MB/s';
      document.getElementById('net-up').innerText = txRate + ' MB/s';
      pushData(netChart, parseFloat(rxRate), 0);
      pushData(netChart, parseFloat(txRate), 1);
    }
    lastNetRx = netRx;
    lastNetTx = netTx;

    // System info
    document.getElementById('platform').innerText = json.system.platform;
    document.getElementById('boot-time').innerText = json.system.boot_time;
    document.getElementById('proc-count').innerText = json.system.process_count;
    document.getElementById('temp').innerText = json.system.temperature;

    // Top processes
    const procsHtml = json.processes.map((p, i) => `
      <div class="process-row">
        <div class="d-flex justify-content-between">
          <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            <strong>${p.name}</strong> <span class="small-muted">(PID: ${p.pid})</span>
          </div>
          <div>
            <span class="badge-custom">${p.cpu}%</span>
            <span class="badge-custom ms-1">${p.memory}</span>
          </div>
        </div>
      </div>
    `).join('');
    document.getElementById('processes').innerHTML = procsHtml;
    document.getElementById('proc-badge').innerText = `Top ${json.processes.length} Processes`;

    updateStatusIndicator(cpu, mem);

  } catch (err) {
    console.error('Fetch error:', err);
    document.getElementById('status-indicator').className = 'status-dot status-critical';
  }
}

// Initialize
(function init() {
  const now = new Date();
  for (let i = 0; i < SAMPLE_COUNT; i++) {
    const t = new Date(now - (SAMPLE_COUNT - i) * 1000).toLocaleTimeString();
    cpuChart.data.labels[i] = t;
    memChart.data.labels[i] = t;
    netChart.data.labels[i] = t;
  }
  cpuChart.update();
  memChart.update();
  netChart.update();
})();

fetchAndUpdate();
setInterval(fetchAndUpdate, 1000);
</script>
</body>
</html>
"""

def bytes2human(n):
    """Convert bytes to human-readable form"""
    symbols = ('B', 'KB', 'MB', 'GB', 'TB', 'PB')
    prefix = {}
    for i, s in enumerate(symbols):
        prefix[s] = 1 << (i * 10)
    for s in reversed(symbols):
        if n >= prefix[s]:
            value = float(n) / prefix[s]
            return f"{value:.2f} {s}"
    return f"{n} B"

def get_uptime():
    """Get system uptime"""
    boot_time = datetime.fromtimestamp(psutil.boot_time())
    uptime = datetime.now() - boot_time
    days = uptime.days
    hours, remainder = divmod(uptime.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    if days > 0:
        return f"{days}d {hours}h {minutes}m"
    elif hours > 0:
        return f"{hours}h {minutes}m"
    else:
        return f"{minutes}m {seconds}s"

def get_cpu_temp():
    """Get CPU temperature if available"""
    try:
        temps = psutil.sensors_temperatures()
        if temps:
            for name, entries in temps.items():
                for entry in entries:
                    if 'core' in entry.label.lower() or 'cpu' in name.lower():
                        return f"{entry.current:.1f}°C"
            # Return first available temp if no CPU-specific found
            for name, entries in temps.items():
                if entries:
                    return f"{entries[0].current:.1f}°C"
        return "N/A"
    except:
        return "N/A"

@app.route("/")
def index():
    return render_template_string(TEMPLATE)

@app.route("/metrics")
def metrics():
    # CPU
    cpu_percent = psutil.cpu_percent(interval=None)
    per_core = psutil.cpu_percent(interval=None, percpu=True)
    cores = psutil.cpu_count(logical=True)
    try:
        cpu_freq = psutil.cpu_freq()
        freq_str = f"{cpu_freq.current / 1000:.2f} GHz" if cpu_freq else "N/A"
    except:
        freq_str = "N/A"

    # Memory
    vm = psutil.virtual_memory()

    # Disk
    try:
        disk = psutil.disk_usage('/')
    except:
        partitions = psutil.disk_partitions(all=False)
        path = partitions[0].mountpoint if partitions else '/'
        disk = psutil.disk_usage(path)

    # Network
    net_io = psutil.net_io_counters()

    # System info
    boot_time = datetime.fromtimestamp(psutil.boot_time()).strftime("%Y-%m-%d %H:%M")
    
    # Top processes by CPU
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            pinfo = proc.info
            processes.append({
                'pid': pinfo['pid'],
                'name': pinfo['name'][:30],
                'cpu': pinfo['cpu_percent'] or 0,
                'memory': bytes2human(pinfo['memory_info'].rss) if pinfo['memory_info'] else '0 B'
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            pass
    
    # Sort by CPU and get top 8
    processes.sort(key=lambda x: x['cpu'], reverse=True)
    top_processes = processes[:8]

    resp = {
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "uptime": get_uptime(),
        "cpu": {
            "percent": cpu_percent,
            "percore": per_core,
            "cores": cores,
            "freq": freq_str
        },
        "mem": {
            "total": vm.total,
            "used": vm.used,
            "percent": vm.percent,
            "used_human": bytes2human(vm.used),
            "total_human": bytes2human(vm.total)
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "percent": disk.percent,
            "used_human": bytes2human(disk.used),
            "total_human": bytes2human(disk.total)
        },
        "network": {
            "bytes_sent": net_io.bytes_sent,
            "bytes_recv": net_io.bytes_recv,
        },
        "system": {
            "platform": psutil.os.name.upper(),
            "boot_time": boot_time,
            "process_count": len(psutil.pids()),
            "temperature": get_cpu_temp()
        },
        "processes": top_processes
    }
    return jsonify(resp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
