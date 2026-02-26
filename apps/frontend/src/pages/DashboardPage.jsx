import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SensorCard from '../components/dashboard/SensorCard';
import KPICard from '../components/dashboard/KPICard';
import SensorChart from '../components/dashboard/SensorChart';
import { sensorApi, talangApi, alertApi } from '../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const DashboardPage = () => {
  const [sensorData, setSensorData] = useState(null);
  const [talangs, setTalangs] = useState([]);
  const [alertCount, setAlertCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [sensorRes, talangRes, alertRes] = await Promise.all([
        sensorApi.getLatest(),
        talangApi.getAll({ isActive: 'true' }),
        alertApi.getCount(),
      ]);

      setSensorData(sensorRes.data);
      setTalangs(talangRes.data);
      setAlertCount(alertRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-greenhouse-600"></div>
      </div>
    );
  }

  const activeTalangs = talangs.filter(t => t.currentBatch);
  const readyToHarvest = activeTalangs.filter(
    t => t.currentBatch?.daysSincePlant >= 28
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Monitor parameter kualitas dan status talang secara real-time
        </p>
      </div>

      {/* Alert Banner */}
      {alertCount && alertCount.total > 0 && (
        <Link
          to="/alert"
          className="block p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium text-red-900">
                {alertCount.total} Alert Aktif
              </p>
              <p className="text-sm text-red-700">
                {alertCount.danger} Bahaya, {alertCount.warning} Peringatan
              </p>
            </div>
            <span className="text-red-700">→</span>
          </div>
        </Link>
      )}

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SensorCard
          title="PPM"
          value={sensorData?.ppm || '-'}
          unit="ppm"
          status={sensorData?.ppmStatus || 'normal'}
          icon="💧"
        />
        <SensorCard
          title="pH"
          value={sensorData?.ph || '-'}
          unit=""
          status={sensorData?.phStatus || 'normal'}
          icon="🧪"
        />
        <SensorCard
          title="Suhu Air"
          value={sensorData?.tempWater || '-'}
          unit="°C"
          status={sensorData?.tempStatus || 'normal'}
          icon="🌊"
        />
        <SensorCard
          title="Suhu Udara"
          value={sensorData?.tempAir || '-'}
          unit="°C"
          status={sensorData?.tempStatus || 'normal'}
          icon="🌡️"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Talang"
          value={talangs.length}
          subtitle="talang aktif"
          icon="🌿"
          color="green"
        />
        <KPICard
          title="Talang Berisi"
          value={activeTalangs.length}
          subtitle={`${Math.round((activeTalangs.length / talangs.length) * 100)}% utilisasi`}
          icon="🌱"
          color="blue"
        />
        <KPICard
          title="Siap Panen"
          value={readyToHarvest.length}
          subtitle="talang"
          icon="🥬"
          color="orange"
        />
        <KPICard
          title="Aktif 24 Jam"
          value="100%"
          subtitle="system uptime"
          icon="⚡"
          color="purple"
        />
      </div>

      {/* Talang Quick View */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Status Talang</h2>
          <Link to="/talang" className="text-greenhouse-600 hover:text-greenhouse-700 text-sm font-medium">
            Lihat Semua →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {talangs.map((talang) => {
            const batch = talang.currentBatch;
            const isReady = batch?.daysSincePlant >= 28;

            return (
              <Link
                key={talang.id}
                to={`/talang/${talang.id}`}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  isReady
                    ? 'border-orange-300 bg-orange-50'
                    : batch
                    ? 'border-greenhouse-200 bg-greenhouse-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">{talang.name}</p>
                {batch ? (
                  <>
                    <p className="text-sm font-medium text-gray-900">{batch.stage}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Hari {batch.daysSincePlant}
                    </p>
                    {isReady && (
                      <span className="status-badge status-warning text-xs mt-2 inline-block">
                        Siap Panen
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">Kosong</p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
