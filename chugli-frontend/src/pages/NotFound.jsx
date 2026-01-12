// src/pages/NotFound.jsx

import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import Logo from "@/components/common/Logo";
import Button from "@/components/common/Button";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center p-6">
      <Logo size="large" />

      <div className="mt-12 text-center">
        <h1 className="text-8xl font-bold gradient-text">404</h1>
        <h2 className="text-2xl font-semibold text-white mt-4">
          Page Not Found
        </h2>
        <p className="text-dark-400 mt-2 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="secondary"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
          >
            Go Back
          </Button>
          <Link to="/dashboard">
            <Button leftIcon={<Home className="w-5 h-5" />}>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
