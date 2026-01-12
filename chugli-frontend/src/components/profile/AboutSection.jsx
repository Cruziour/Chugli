// src/components/profile/AboutSection.jsx

import {
  MessageCircle,
  Github,
  Twitter,
  Globe,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import Logo from "@/components/common/Logo";

const AboutSection = ({ isOpen, onClose }) => {
  const features = [
    {
      icon: Shield,
      title: "Privacy First",
      description: "Messages are never stored. Zero data footprint.",
    },
    {
      icon: Zap,
      title: "Real-time",
      description: "Instant messaging with WebSocket technology.",
    },
    {
      icon: Users,
      title: "Hyper-local",
      description: "Connect with people within 500m to 5km.",
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="default">
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="large" />
        </div>

        {/* Version */}
        <div>
          <p className="text-dark-400 text-sm">Version 1.0.0</p>
        </div>

        {/* Description */}
        <p className="text-dark-300 max-w-sm mx-auto">
          Chugli is a hyper-local messaging platform that connects people in
          your neighborhood without storing any messages.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 py-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-dark-700/50 rounded-lg"
            >
              <div className="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-left">
                <h4 className="font-medium text-white">{feature.title}</h4>
                <p className="text-sm text-dark-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-dark-700" />

        {/* Tech Stack */}
        <div>
          <h4 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-3">
            Built With
          </h4>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              "React",
              "Redux",
              "Node.js",
              "MongoDB",
              "Socket.io",
              "Tailwind CSS",
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-dark-700 text-dark-300 text-sm rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4 pt-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-dark-700 text-dark-400 hover:text-white hover:bg-dark-600 
                     rounded-lg transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-dark-700 text-dark-400 hover:text-white hover:bg-dark-600 
                     rounded-lg transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a
            href="https://chugli.app"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-dark-700 text-dark-400 hover:text-white hover:bg-dark-600 
                     rounded-lg transition-colors"
          >
            <Globe className="w-5 h-5" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xs text-dark-500">
          © {new Date().getFullYear()} Chugli. Made with 💙
        </p>
      </div>
    </Modal>
  );
};

export default AboutSection;
