// src/components/common/EmptyState.jsx

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-6">
          <div className="text-dark-500">{icon}</div>
        </div>
      )}

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>

      {description && (
        <p className="text-dark-400 max-w-sm mb-6">{description}</p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
