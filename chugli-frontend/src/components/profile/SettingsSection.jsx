// src/components/profile/SettingsSection.jsx

const SettingsSection = ({ title, children }) => {
  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
      {/* Section Title */}
      <div className="px-4 py-3 border-b border-dark-700">
        <h2 className="text-sm font-semibold text-dark-400 uppercase tracking-wider">
          {title}
        </h2>
      </div>

      {/* Items */}
      <div className="divide-y divide-dark-700">{children}</div>
    </div>
  );
};

export default SettingsSection;
