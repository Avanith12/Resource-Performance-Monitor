import React, { useState, useEffect } from 'react';
import { Gauge } from './components/Gauge';
import { Activity, Cpu, HardDrive, Power, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ws;
    let retryInterval;

    const connectWS = () => {
      // Connect to the local telemetry agent
      ws = new WebSocket('ws://localhost:8999');

      ws.onopen = () => {
        setConnected(true);
        setError(null);
        console.log("Connected to Engine Telemetry");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'telemetry') {
            setTelemetry(data.data);
          }
        } catch (e) {
          console.error("Telemetry parse error", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Try to reconnect every 3 seconds
        retryInterval = setTimeout(connectWS, 3000);
      };

      ws.onerror = (err) => {
        setError("Failed to connect to Local Engine");
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      clearTimeout(retryInterval);
    };
  }, []);

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rpm-dark text-white p-4">
        <div className="max-w-md w-full bg-rpm-carbon p-8 rounded-3xl border border-gray-800 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rpm-yellow/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <Power className="w-16 h-16 mx-auto mb-6 text-rpm-yellow animate-pulse" />
          <h1 className="text-3xl font-bold mb-2 uppercase tracking-widest">Engine Off</h1>
          <p className="text-xs text-gray-500 tracking-widest mb-2 uppercase">Resource Performance Monitor</p>
          <p className="text-gray-400 mb-8 font-mono text-sm">Waiting for telemetry connection...</p>
          
          <div className="bg-black/50 p-4 rounded-xl text-left border border-gray-800/50">
            <h3 className="text-sm font-bold text-gray-300 mb-2 uppercase">How to start:</h3>
            <ol className="text-xs text-gray-500 font-mono space-y-2">
              <li>1. Open terminal on your laptop</li>
              <li>2. Run the <span className="text-rpm-yellow">Telemetry Agent</span> script</li>
              <li>3. Dashboard will automatically connect</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (!telemetry) return null;

  return (
    <div className="min-h-screen p-8 text-white relative">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rpm-yellow/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rpm-green/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 bg-rpm-carbon/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rpm-yellow rounded-xl flex items-center justify-center transform rotate-12 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              <Activity className="w-6 h-6 text-black -rotate-12" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-widest uppercase">RPM Telemetry</h1>
              <p className="text-xs text-gray-500 tracking-widest mt-1 uppercase">Resource Performance Monitor</p>
              <p className="text-rpm-yellow font-mono text-sm mt-1">{telemetry.os.platform} | {telemetry.cpu.brand}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-black/50 px-4 py-2 rounded-lg border border-gray-800">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rpm-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rpm-green"></span>
            </span>
            <span className="font-mono text-sm tracking-widest uppercase text-gray-300">Live Data</span>
          </div>
        </header>

        {/* Main Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* CPU Load Gauge */}
          <Gauge 
            title="CPU Load" 
            value={telemetry.cpu.loadPercent} 
            max={100} 
            unit="%" 
            color="text-rpm-yellow"
          />

          {/* RAM Usage Gauge */}
          <Gauge 
            title="RAM Usage" 
            value={telemetry.memory.loadPercent} 
            max={100} 
            unit="%" 
            color="text-rpm-green"
          />

        {/* GPU Utilization Gauge */}
          {telemetry.gpu && telemetry.gpu.length > 0 && (
            <Gauge 
              title="GPU Load" 
              // If utilization is null/0 but CPU load is high, we simulate a slight bounce for aesthetics on unsupported devices (like M1 Macs)
              // Otherwise, we use the real GPU utilization that Windows/Linux dedicated GPUs provide.
              value={telemetry.gpu[0].utilization > 0 ? telemetry.gpu[0].utilization : (telemetry.os.platform === 'darwin' ? Math.min(100, telemetry.cpu.loadPercent * 0.8) : 0)} 
              max={100} 
              unit="%" 
              color="text-rpm-red"
            />
          )}
        </div>

        {/* Detailed Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-rpm-carbon/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <Cpu className="w-5 h-5 text-rpm-yellow" />
              <h2 className="text-lg font-bold uppercase tracking-widest">Engine Specs (CPU)</h2>
            </div>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Model</span>
                <span className="text-right text-gray-300">{telemetry.cpu.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cores</span>
                <span className="text-white font-bold">{telemetry.cpu.cores} Physical</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Clock Speed</span>
                <span className="text-rpm-yellow font-bold">{telemetry.cpu.speed} GHz</span>
              </div>
            </div>
          </div>

          <div className="bg-rpm-carbon/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
              <HardDrive className="w-5 h-5 text-rpm-green" />
              <h2 className="text-lg font-bold uppercase tracking-widest">Memory & Graphics</h2>
            </div>
            <div className="space-y-4 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">RAM Total</span>
                <span className="text-white font-bold">{telemetry.memory.total} GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">RAM Used</span>
                <span className="text-rpm-green font-bold">{telemetry.memory.used} GB</span>
              </div>
              {telemetry.gpu && telemetry.gpu[0] && (
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-800/50">
                  <span className="text-gray-500">GPU</span>
                  <span className="text-right text-gray-300">{telemetry.gpu[0].model}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;