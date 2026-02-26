import { useState, useEffect } from 'react';
import { alertApi } from '../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const AlertPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [filter]);

  const loadAlerts = async () => {
    try {
      const response = await alertApi.getAll(
        filter === 'all' ? {} : { status: filter.toUpperCase() }
      );
      setAlerts(response.data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (alertId) => {
    const notes = prompt('Catatan penyelesaian (opsional):');
    try {
      await alertApi.resolve(alertId, notes || '');
      loadAlerts();
    } catch (error) {
      alert('Gagal menyelesaikan alert: ' + error.message);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'danger': return '🔴';
      case 'warning': return '🟡';
      default: return '🟢';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'danger': return 'border-red-400 bg-red-50';
      case 'warning': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTime = (date) => {
    return format(new Date(date), 'dd MMM HH:mm', { locale: id });
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alert & Notifikasi</h1>
          <p className="text-gray-500 mt-1">
            Peringatan parameter dan tindakan koreksi
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'active', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-greenhouse-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'Semua' : status === 'active' ? 'Aktif' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Alert Aktif ({activeAlerts.length})
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`card border-l-4 p-6 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                      <h3 className="font-semibold text-gray-900">{alert.message}</h3>
                      <span className={`status-badge ${
                        alert.severity === 'danger' ? 'status-danger' : 'status-warning'
                      }`}>
                        {alert.severity === 'danger' ? 'Bahaya' : 'Peringatan'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500">Parameter</p>
                        <p className="font-medium">{alert.type.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Nilai Saat Ini</p>
                        <p className="font-medium">{alert.currentValue}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Threshold</p>
                        <p className="font-medium">
                          {alert.thresholdMin} - {alert.thresholdMax}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Waktu</p>
                        <p className="font-medium">{formatTime(alert.createdAt)}</p>
                      </div>
                    </div>

                    {alert.action && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-900">
                          <span className="font-medium">Tindakan Koreksi:</span> {alert.action}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="ml-4 btn btn-primary text-sm"
                  >
                    Selesaikan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Riwayat Alert ({resolvedAlerts.length})
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diselesaikan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resolvedAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                      {formatTime(alert.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {alert.type.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {alert.message}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {alert.resolvedAt ? formatTime(alert.resolvedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {alert.resolutionNotes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {alerts.length === 0 && !isLoading && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Alert</h3>
          <p className="text-gray-500">
            Semua parameter dalam kondisi normal
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertPage;
