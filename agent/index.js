const { WebSocketServer } = require('ws');
const si = require('systeminformation');

// Start WebSocket server on port 8999 (RPM theme!)
const wss = new WebSocketServer({ port: 8999 });

console.log('RPM Telemetry Agent Started!');
console.log('Listening for dashboard connections on ws://localhost:8999');

// Helper function to grab all system stats
async function getSystemStats() {
  try {
    const [cpu, mem, graphics, currentLoad, osInfo] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.graphics(),
      si.currentLoad(),
      si.osInfo()
    ]);

    return {
      type: 'telemetry',
      data: {
        cpu: {
          manufacturer: cpu.manufacturer || cpu.vendor || 'Unknown',
          brand: cpu.brand || 'Apple Silicon',
          cores: cpu.physicalCores || (cpu.performanceCores + cpu.efficiencyCores) || cpu.cores || 'Unknown',
          speed: cpu.speed || cpu.speedMax || 'Auto',
          loadPercent: currentLoad.currentLoad.toFixed(1),
        },
        memory: {
          total: (mem.total / 1024 / 1024 / 1024).toFixed(2), // GB
          used: (mem.active / 1024 / 1024 / 1024).toFixed(2), // GB
          loadPercent: ((mem.active / mem.total) * 100).toFixed(1),
        },
        gpu: graphics.controllers.map(g => {
          // systeminformation sometimes returns null or undefined for Apple Silicon GPU utilization
          // On Windows/Linux with dedicated GPUs, it usually returns a valid number.
          let util = g.utilizationGpu;
          if (util === null || util === undefined) {
             util = 0;
          }
          return {
            model: g.model || 'Integrated Graphics',
            vram: g.vram || 'Dynamic',
            utilization: util
          };
        }),
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
        }
      }
    };
  } catch (e) {
    console.error("Error reading telemetry:", e);
    return null;
  }
}

wss.on('connection', (ws) => {
  console.log('Dashboard connected! Starting telemetry...');

  // Send static system info immediately on connect
  getSystemStats().then(stats => {
    if (stats) ws.send(JSON.stringify(stats));
  });

  // Start sending live telemetry data every 1000ms (1 second)
  const interval = setInterval(async () => {
    const stats = await getSystemStats();
    if (stats && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(stats));
    }
  }, 1000);

  ws.on('close', () => {
    console.log('Dashboard disconnected. Idling...');
    clearInterval(interval);
  });
});
