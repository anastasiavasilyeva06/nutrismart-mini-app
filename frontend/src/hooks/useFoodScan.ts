import { useCallback, useState } from "react";
import { api } from "../services/api";
import type { FoodAnalysis } from "../types/food";

export const useFoodScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FoodAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanFood = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/food/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000
      });

      setResult(response.data);
    } catch (err: any) {
      const message = err?.response?.data?.error || "Failed to analyze food. Please try again.";
      setError(message);
      console.error("Food scan error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { scanFood, isLoading, result, error, clearResult };
};

