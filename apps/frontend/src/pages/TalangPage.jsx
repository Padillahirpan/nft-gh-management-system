import { useState, useEffect } from 'react';
import { talangApi, batchApi } from '../services/api';

const TalangPage = () => {
  const [talangs, setTalangs] = useState([]);
  const [selectedTalang, setSelectedTalang] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTalangs();
  }, []);

  const loadTalangs = async () => {
    try {
      const response = await talangApi.getAll({ isActive: 'true' });
      setTalangs(response.data);
    } catch (error) {
      console.error('Error loading talangs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageUpgrade = async (batchId, currentStage) => {
    const stages = ['SEMAI', 'TRANSPLANT', 'VEGETATIF', 'PANEN'];
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      const newStage = stages[currentIndex + 1];
      try {
        await batchApi.updateStage(batchId, newStage, `Upgrade ke ${newStage}`);
        loadTalangs();
      } catch (error) {
        console.error('Error updating stage:', error);
        alert('Gagal mengupdate stage: ' + error.message);
      }
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'SEMAI': return 'bg-yellow-100 text-yellow-800';
      case 'TRANSPLANT': return 'bg-blue-100 text-blue-800';
      case 'VEGETATIF': return 'bg-green-100 text-green-800';
      case 'PANEN': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'BAIK': return 'text-green-600';
      case 'PERLU_PERHATIAN': return 'text-yellow-600';
      case 'KRITIS': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Talang</h1>
          <p className="text-gray-500 mt-1">
            Kelola setiap talang dari semai hingga panen
          </p>
        </div>
      </div>

      {/* Talang Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {talangs.map((talang) => {
          const batch = talang.currentBatch;
          const daysSincePlant = batch?.daysSincePlant || 0;
          const isReady = daysSincePlant >= 28;

          return (
            <div
              key={talang.id}
              className={`card p-6 cursor-pointer transition-all hover:shadow-md ${
                isReady ? 'ring-2 ring-orange-400' : ''
              }`}
              onClick={() => setSelectedTalang(talang)}
            >
              {/* Talang Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{talang.name}</h3>
                {batch && (
                  <span className={`status-badge ${getStageColor(batch.stage)}`}>
                    {batch.stage}
                  </span>
                )}
              </div>

              {batch ? (
                <>
                  {/* Batch Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Varietas</span>
                      <span className="font-medium">{batch.variety}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Hari ke-</span>
                      <span className="font-medium">{daysSincePlant}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Slot Terisi</span>
                      <span className="font-medium">
                        {batch.filledSlots}/{talang.totalSlots}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Kesehatan</span>
                      <span className={`font-medium ${getHealthColor(batch.health)}`}>
                        {batch.health === 'BAIK' ? 'Baik' : batch.health === 'PERLU_PERHATIAN' ? 'Perlu Perhatian' : 'Kritis'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-greenhouse-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((daysSincePlant / 28) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isReady ? 'Siap Panen!' : `${28 - daysSincePlant} hari lagi`}
                    </p>
                  </div>

                  {/* Action Button */}
                  {batch.stage !== 'PANEN' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStageUpgrade(batch.id, batch.stage);
                      }}
                      className="w-full btn btn-primary text-sm"
                    >
                      Naik Stage →
                    </button>
                  )}
                </>
              ) : (
                /* Empty Talang */
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🌱</div>
                  <p className="text-gray-500 mb-4">Talang Kosong</p>
                  <button className="btn btn-primary text-sm">
                    Mulai Batch Baru
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stage Reference */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Referensi Stage</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="status-badge bg-yellow-100 text-yellow-800 mb-2 inline-block">SEMAI</span>
            <p className="text-gray-500">Hari 1-7</p>
            <p className="text-gray-500">PPM: 400-600</p>
          </div>
          <div>
            <span className="status-badge bg-blue-100 text-blue-800 mb-2 inline-block">TRANSPLANT</span>
            <p className="text-gray-500">Hari 8-14</p>
            <p className="text-gray-500">PPM: 600-800</p>
          </div>
          <div>
            <span className="status-badge bg-green-100 text-green-800 mb-2 inline-block">VEGETATIF</span>
            <p className="text-gray-500">Hari 15-28</p>
            <p className="text-gray-500">PPM: 800-1200</p>
          </div>
          <div>
            <span className="status-badge bg-orange-100 text-orange-800 mb-2 inline-block">PANEN</span>
            <p className="text-gray-500">Hari 28+</p>
            <p className="text-gray-500">Siap dipanen</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalangPage;
