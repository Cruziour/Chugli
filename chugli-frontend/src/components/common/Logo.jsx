import { MessageCircle } from "lucide-react";

const Logo = ({ size = "default", showText = true }) => {
  const sizes = {
    small: {
      icon: "w-6 h-6",
      text: "text-lg",
    },
    default: {
      icon: "w-8 h-8",
      text: "text-2xl",
    },
    large: {
      icon: "w-12 h-12",
      text: "text-4xl",
    },
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500 blur-lg opacity-50 rounded-full" />
        <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-xl">
          <MessageCircle className={`${currentSize.icon} text-white`} />
        </div>
      </div>
      {showText && (
        <span className={`${currentSize.text} font-bold gradient-text`}>
          Chugli
        </span>
      )}
    </div>
  );
};

export default Logo;
