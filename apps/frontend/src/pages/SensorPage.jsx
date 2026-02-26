import { useState, useEffect } from 'react';
import { sensorApi } from '../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const SensorPage = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedRange, setSelectedRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSensorData();
  }, [selectedRange]);

  const loadSensorData = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let from;

      switch (selectedRange) {
        case '24h':
          from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const [historyRes, statsRes] = await Promise.all([
        sensorApi.getHistory({ from: from.toISOString(), limit: selectedRange === '24h' ? 48 : 200 }),
        sensorApi.getStats({ from: from.toISOString() }),
      ]);

      setHistory(historyRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading sensor data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallStatus = (reading) => {
    if (reading.overallStatus === 'danger') return 'status-danger';
    if (reading.overallStatus === 'warning') return 'status-warning';
    return 'status-normal';
  };

  const formatTime = (date) => {
    return format(new Date(date), 'dd MMM HH:mm', { locale: id });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Log Sensor</h1>
          <p className="text-gray-500 mt-1">
            Riwayat pembacaan sensor dan statistik
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex gap-2">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedRange === range
                  ? 'bg-greenhouse-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {range === '24h' ? '24 Jam' : range === '7d' ? '7 Hari' : '30 Hari'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">PPM</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.ppm.avg.toFixed(0)}</p>
                <p className="text-xs text-gray-500">
                  Min: {stats.ppm.min} | Max: {stats.ppm.max}
                </p>
              </div>
              <span className="text-2xl">💧</span>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">pH</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.ph.avg.toFixed(1)}</p>
                <p className="text-xs text-gray-500">
                  Min: {stats.ph.min} | Max: {stats.ph.max}
                </p>
              </div>
              <span className="text-2xl">🧪</span>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">Suhu Air</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.tempWater.avg.toFixed(1)}°C</p>
                <p className="text-xs text-gray-500">
                  Min: {stats.tempWater.min}°C | Max: {stats.tempWater.max}°C
                </p>
              </div>
              <span className="text-2xl">🌊</span>
            </div>
          </div>

          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">Suhu Udara</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.tempAir.avg.toFixed(1)}°C</p>
                <p className="text-xs text-gray-500">
                  Min: {stats.tempAir.min}°C | Max: {stats.tempAir.max}°C
                </p>
              </div>
              <span className="text-2xl">🌡️</span>
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PPM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">pH</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suhu Air</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suhu Udara</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelembaban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greenhouse-600"></div>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data sensor
                  </td>
                </tr>
              ) : (
                history.map((reading) => (
                  <tr key={reading.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {formatTime(reading.recordedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reading.ppm.toFixed(0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reading.ph.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reading.tempWater.toFixed(1)}°C
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reading.tempAir.toFixed(1)}°C
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {reading.humidity?.toFixed(0)}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${getOverallStatus(reading)}`}>
                        {reading.overallStatus === 'normal' ? 'Normal' : reading.overallStatus === 'warning' ? 'Peringatan' : 'Bahaya'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parameter Reference */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Referensi Parameter Optimal</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="font-medium text-gray-900 mb-2">PPM</p>
            <p className="text-gray-500">Normal: 800 - 1200 ppm</p>
            <p className="text-xs text-gray-400 mt-1">Konsentrasi nutrisi</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">pH</p>
            <p className="text-gray-500">Normal: 5.5 - 6.5</p>
            <p className="text-xs text-gray-400 mt-1">Tingkat keasaman</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">Suhu Air</p>
            <p className="text-gray-500">Normal: 18 - 24°C</p>
            <p className="text-xs text-gray-400 mt-1">Suhu larutan nutrisi</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-2">Suhu Udara</p>
            <p className="text-gray-500">Normal: 18 - 28°C</p>
            <p className="text-xs text-gray-400 mt-1">Suhu greenhouse</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorPage;
