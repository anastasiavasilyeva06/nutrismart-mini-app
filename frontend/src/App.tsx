import React from "react";
import { Routes, Route } from "react-router-dom";
import { HomeScreen } from "./components/screens/HomeScreen";
import { ScanScreen } from "./components/screens/ScanScreen";
import { PlanScreen } from "./components/screens/PlanScreen";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/scan" element={<ScanScreen />} />
      <Route path="/plan" element={<PlanScreen />} />
      <Route path="*" element={<HomeScreen />} />
    </Routes>
  );
};

