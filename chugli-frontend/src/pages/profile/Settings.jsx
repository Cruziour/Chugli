// src/pages/profile/Settings.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Trash2,
  Bell,
  Shield,
  Info,
  ChevronRight,
  Moon,
  Smartphone,
  HelpCircle,
  FileText,
  Mail,
  ExternalLink,
} from "lucide-react";

import ChangePassword from "@/components/profile/ChangePassword";
import DeleteAccount from "@/components/profile/DeleteAccount";
import SettingsItem from "@/components/profile/SettingsItem";
import SettingsSection from "@/components/profile/SettingsSection";
import AboutSection from "@/components/profile/AboutSection";

const Settings = () => {
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <SettingsSection title="Account">
        <SettingsItem
          icon={Lock}
          iconColor="text-primary-400"
          iconBg="bg-primary-500/20"
          title="Change Password"
          description="Update your account password"
          onClick={() => setShowChangePassword(true)}
        />

        <SettingsItem
          icon={Mail}
          iconColor="text-green-400"
          iconBg="bg-green-500/20"
          title="Email"
          description="Verified"
          showArrow={false}
          badge={
            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              Verified
            </span>
          }
        />
      </SettingsSection>

      {/* Preferences Section */}
      <SettingsSection title="Preferences">
        <SettingsItem
          icon={Bell}
          iconColor="text-yellow-400"
          iconBg="bg-yellow-500/20"
          title="Notifications"
          description="Manage notification settings"
          badge={
            <span className="px-2 py-0.5 bg-dark-700 text-dark-400 text-xs rounded-full">
              Coming Soon
            </span>
          }
          disabled
        />

        <SettingsItem
          icon={Moon}
          iconColor="text-purple-400"
          iconBg="bg-purple-500/20"
          title="Theme"
          description="Dark theme (default)"
          showArrow={false}
          badge={
            <span className="px-2 py-0.5 bg-dark-700 text-dark-300 text-xs rounded-full">
              Dark
            </span>
          }
        />
      </SettingsSection>

      {/* Privacy & Security Section */}
      <SettingsSection title="Privacy & Security">
        <SettingsItem
          icon={Shield}
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/20"
          title="Privacy"
          description="Your data is never stored"
          showArrow={false}
          badge={
            <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
              Protected
            </span>
          }
        />

        <SettingsItem
          icon={Trash2}
          iconColor="text-red-400"
          iconBg="bg-red-500/20"
          title="Delete Account"
          description="Permanently delete your account"
          onClick={() => setShowDeleteAccount(true)}
          danger
        />
      </SettingsSection>

      {/* About Section */}
      <SettingsSection title="About">
        <SettingsItem
          icon={Info}
          iconColor="text-dark-300"
          iconBg="bg-dark-700"
          title="About Chugli"
          description="Version 1.0.0"
          onClick={() => setShowAbout(true)}
        />

        <SettingsItem
          icon={HelpCircle}
          iconColor="text-dark-300"
          iconBg="bg-dark-700"
          title="Help & Support"
          description="Get help with Chugli"
          onClick={() => window.open("mailto:support@chugli.app", "_blank")}
          rightIcon={<ExternalLink className="w-4 h-4" />}
        />

        <SettingsItem
          icon={FileText}
          iconColor="text-dark-300"
          iconBg="bg-dark-700"
          title="Terms & Privacy Policy"
          description="Read our terms and privacy policy"
          onClick={() => window.open("/terms", "_blank")}
          rightIcon={<ExternalLink className="w-4 h-4" />}
        />
      </SettingsSection>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-dark-500 text-sm">
          Made with 💙 for local communities
        </p>
        <p className="text-dark-600 text-xs mt-1">
          © {new Date().getFullYear()} Chugli. All rights reserved.
        </p>
      </div>

      {/* Modals */}
      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      <DeleteAccount
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
      />

      <AboutSection isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};

export default Settings;
