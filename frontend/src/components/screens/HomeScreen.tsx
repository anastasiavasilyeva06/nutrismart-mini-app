import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../common/Button";

export const HomeScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-bold text-slate-900">NutriSmart</h1>
        <p className="text-slate-600">AI-помощник питания (Gemini + Vercel)</p>
      </div>

      <div className="p-4 space-y-3">
        <Link to="/scan">
          <Button className="w-full">Scan Food</Button>
        </Link>
        <Link to="/plan">
          <Button variant="secondary" className="w-full">
            Meal Plans
          </Button>
        </Link>
      </div>
    </div>
  );
};

