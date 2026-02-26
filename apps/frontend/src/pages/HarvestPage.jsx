import { useState, useEffect } from 'react';
import { harvestApi } from '../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const HarvestPage = () => {
  const [harvests, setHarvests] = useState([]);
  const [stats, setStats] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    batchId: '',
    totalWeight: '',
    headCount: '',
    gradeACount: '',
    gradeAWeight: '',
    gradeBCount: '',
    gradeBWeight: '',
    gradeCCount: '',
    gradeCWeight: '',
    notes: '',
  });

  useEffect(() => {
    loadHarvestData();
  }, []);

  const loadHarvestData = async () => {
    try {
      const [harvestRes, statsRes] = await Promise.all([
        harvestApi.getAll({ limit: 50 }),
        harvestApi.getStats(),
      ]);

      setHarvests(harvestRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading harvest data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await harvestApi.create({
        ...formData,
        totalWeight: parseInt(formData.totalWeight),
        headCount: parseInt(formData.headCount),
        gradeACount: parseInt(formData.gradeACount) || 0,
        gradeAWeight: parseInt(formData.gradeAWeight) || 0,
        gradeBCount: parseInt(formData.gradeBCount) || 0,
        gradeBWeight: parseInt(formData.gradeBWeight) || 0,
        gradeCCount: parseInt(formData.gradeCCount) || 0,
        gradeCWeight: parseInt(formData.gradeCWeight) || 0,
      });
      setShowForm(false);
      loadHarvestData();
    } catch (error) {
      alert('Gagal mencatat panen: ' + error.message);
    }
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd MMM yyyy', { locale: id });
  };

  const formatWeight = (grams) => {
    return `${grams}g (${(grams / 1000).toFixed(2)}kg)`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-greenhouse-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Panen</h1>
          <p className="text-gray-500 mt-1">
            Catat dan kelola hasil panen selada
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          + Catat Panen
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">Total Yield</p>
            <p className="text-2xl font-bold">{stats.totalYieldKg} kg</p>
            <p className="text-xs text-gray-500">{stats.totalHarvests} panen</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">Rata-rata Yield</p>
            <p className="text-2xl font-bold">{stats.avgYieldPerHarvest}g</p>
            <p className="text-xs text-gray-500">per panen</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">Rata-rata Kepala</p>
            <p className="text-2xl font-bold">{stats.avgHeadsPerHarvest}</p>
            <p className="text-xs text-gray-500">per panen</p>
          </div>
          <div className="card p-6">
            <p className="text-sm text-gray-500 mb-2">Grade A</p>
            <p className="text-2xl font-bold">{stats.gradeDistribution.A.percentage}%</p>
            <p className="text-xs text-gray-500">{stats.gradeDistribution.A.count} kepala</p>
          </div>
        </div>
      )}

      {/* Harvest Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Catat Panen Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch ID
                </label>
                <input
                  type="text"
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Berat (g)
                  </label>
                  <input
                    type="number"
                    value={formData.totalWeight}
                    onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Kepala
                  </label>
                  <input
                    type="number"
                    value={formData.headCount}
                    onChange={(e) => setFormData({ ...formData, headCount: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Detail Grade</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Grade A - Jumlah</label>
                    <input
                      type="number"
                      value={formData.gradeACount}
                      onChange={(e) => setFormData({ ...formData, gradeACount: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Grade A - Berat (g)</label>
                    <input
                      type="number"
                      value={formData.gradeAWeight}
                      onChange={(e) => setFormData({ ...formData, gradeAWeight: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Grade B - Jumlah</label>
                    <input
                      type="number"
                      value={formData.gradeBCount}
                      onChange={(e) => setFormData({ ...formData, gradeBCount: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Grade B - Berat (g)</label>
                    <input
                      type="number"
                      value={formData.gradeBWeight}
                      onChange={(e) => setFormData({ ...formData, gradeBWeight: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Grade C - Jumlah</label>
                    <input
                      type="number"
                      value={formData.gradeCCount}
                      onChange={(e) => setFormData({ ...formData, gradeCCount: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Grade C - Berat (g)</label>
                    <input
                      type="number"
                      value={formData.gradeCWeight}
                      onChange={(e) => setFormData({ ...formData, gradeCWeight: e.target.value })}
                      className="input text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Harvest Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Talang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kepala</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {harvests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Belum ada data panen
                  </td>
                </tr>
              ) : (
                harvests.map((harvest) => (
                  <tr key={harvest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(harvest.harvestDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {harvest.talangName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatWeight(harvest.totalWeight)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {harvest.headCount}
                      <span className="text-gray-500 ml-1">
                        ({harvest.avgWeight.toFixed(0)}g/kepala)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <span className="status-badge bg-green-100 text-green-800">
                          A: {harvest.gradeA.count}
                        </span>
                        <span className="status-badge bg-blue-100 text-blue-800">
                          B: {harvest.gradeB.count}
                        </span>
                        <span className="status-badge bg-gray-100 text-gray-800">
                          C: {harvest.gradeC.count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-badge ${
                        harvest.saleStatus === 'TERJUAL' ? 'status-normal' : 'status-warning'
                      }`}>
                        {harvest.saleStatus === 'TERJUAL' ? 'Terjual' : 'Stok'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HarvestPage;
