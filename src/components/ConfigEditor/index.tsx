import { useState, useEffect } from 'react';
import { useAppConfig } from '../../hooks/useAppConfig';
import Button from '../Button';
import Input from '../Input';

export default function ConfigEditor() {
  const { config, loading, error, updateConfig } = useAppConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update local config when the global config changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      await updateConfig(localConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalConfig(config);
  };

  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config);

  if (loading) {
    return <div className="p-4">Loading config...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Failed to load config: {error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">System Settings</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="User Name"
              value={localConfig.user.name}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  user: { ...localConfig.user, name: e.target.value },
                })
              }
              placeholder="Enter user name"
            />
            <Input
              label="Initials"
              value={localConfig.user.initials}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  user: { ...localConfig.user, initials: e.target.value },
                })
              }
              placeholder="JD"
              maxLength={3}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Business</h3>
          <div className="space-y-4">
            <Input
              label="Organization Name"
              value={localConfig.business.name}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  business: { ...localConfig.business, name: e.target.value },
                })
              }
              placeholder="John's Supplies"
            />
            <Input
              label="Reception Point"
              value={localConfig.business.point}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  business: { ...localConfig.business, point: e.target.value },
                })
              }
              placeholder="Point #1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        {' '}
        <div className="flex gap-3">
          <Button
            label={saving ? 'Saving...' : 'Save'}
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <Button
            label="Cancel"
            onClick={handleReset}
            disabled={!hasChanges || saving}
            variant="secondary"
          />
        </div>
        {saveSuccess && (
          <div className="text-green-600 font-medium">Settings saved successfully!</div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t text-sm text-gray-600">
        <p>
          <strong>Note:</strong> In the compiled application, the configuration file is stored in
          the user's AppData folder and can be edited manually.
        </p>
      </div>
    </div>
  );
}
