import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { api } from "./services/api";

const Shell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="mx-auto max-w-md p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div className="font-semibold">NutriSmart</div>
        <nav className="text-sm flex gap-3">
          <Link className="text-slate-700 hover:text-slate-900" to="/">
            Home
          </Link>
          <Link className="text-slate-700 hover:text-slate-900" to="/debug">
            Debug
          </Link>
        </nav>
      </header>
      {children}
    </div>
  </div>
);

const Home: React.FC = () => {
  const [health, setHealth] = useState<string>("");
  const [error, setError] = useState<string>("");

  const ping = async () => {
    setError("");
    setHealth("");
    try {
      const res = await api.get("/health");
      setHealth(JSON.stringify(res.data));
    } catch (e) {
      setError("Не удалось достучаться до /api/health. Проверьте, что backend запущен на 3001.");
      console.error(e);
    }
  };

  return (
    <Shell>
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
        <div className="font-semibold text-lg">Проверка работы</div>
        <p className="text-sm text-slate-600">
          Нажмите кнопку — фронт сделает запрос на <code className="px-1 py-0.5 bg-slate-100 rounded">/api/health</code>.
        </p>
        <button
          onClick={ping}
          className="w-full rounded-lg bg-slate-900 text-white py-2.5 font-medium hover:bg-slate-800 active:bg-slate-950"
        >
          Ping API
        </button>

        {health ? (
          <pre className="text-xs bg-slate-50 border rounded-lg p-3 overflow-auto">{health}</pre>
        ) : null}
        {error ? (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
        ) : null}
      </div>
    </Shell>
  );
};

const Debug: React.FC = () => {
  return (
    <Shell>
      <div className="bg-white rounded-xl shadow-sm border p-4 space-y-2">
        <div className="font-semibold">Если ничего не открывается</div>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>Убедитесь, что фронт запущен и пишет в консоли URL (обычно http://localhost:3000).</li>
          <li>Убедитесь, что бэкенд запущен на порту 3001.</li>
          <li>Откройте в браузере напрямую: http://localhost:3001/api/health.</li>
        </ul>
      </div>
    </Shell>
  );
};

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/debug" element={<Debug />} />
    </Routes>
  );
};

