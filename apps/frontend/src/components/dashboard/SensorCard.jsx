const SensorCard = ({ title, value, unit, status, icon, trend }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'status-normal';
      case 'warning':
        return 'status-warning';
      case 'danger':
        return 'status-danger';
      default:
        return 'status-normal';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className={`status-badge ${getStatusColor(status)}`}>
          {status === 'normal' ? 'Normal' : status === 'warning' ? 'Peringatan' : 'Bahaya'}
        </span>
        {trend && (
          <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default SensorCard;
