import React, { useCallback, useRef, useState } from "react";
import { Camera, X, Check, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { useFoodScan } from "../../hooks/useFoodScan";
import { useFoodStore } from "../../store/foodStore";
import { Button } from "../common/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { Input } from "../common/Input";
import { Modal } from "../common/Modal";
import { telegram } from "../../services/telegram";
import type { FoodAnalysis } from "../../types/food";

export const ScanScreen: React.FC = () => {
  const { scanFood, isLoading, result, error, clearResult } = useFoodScan();
  const { logFood } = useFoodStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedFood, setEditedFood] = useState<Partial<FoodAnalysis>>({});
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        telegram.showAlert("Image too large. Please select a smaller image (max 10MB).");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreview(imageUrl);
        scanFood(file);
        telegram.hapticFeedback("light");
      };
      reader.readAsDataURL(file);
    },
    [scanFood]
  );

  const handleCameraClick = useCallback(() => {
    telegram.hapticFeedback("medium");
    fileInputRef.current?.click();
  }, []);

  const resetScan = useCallback(() => {
    setPreview(null);
    setEditMode(false);
    setEditedFood({});
    clearResult();
    telegram.hapticFeedback("light");
  }, [clearResult]);

  const handleLogFood = useCallback(async () => {
    if (!result) return;
    const foodToLog = editMode ? { ...result, ...editedFood } : result;
    const portionSize = Number(foodToLog.portionSize ?? result.portionSize);
    const caloriesPer100 = Number(foodToLog.calories ?? result.calories);
    const portionCalories = Math.round((caloriesPer100 * portionSize) / 100);

    await logFood({
      ...foodToLog,
      mealType: selectedMealType,
      imageUrl: preview || undefined,
      portionCalories
    });

    telegram.hapticFeedback("success");
    telegram.showAlert("Food logged successfully!");
    setShowConfirmModal(false);
    resetScan();
  }, [result, editMode, editedFood, selectedMealType, preview, logFood, resetScan]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Scan Food</h1>
        {preview ? (
          <button onClick={resetScan} className="p-2 text-gray-500" aria-label="Reset">
            <X size={20} />
          </button>
        ) : null}
      </div>

      <div className="p-4 space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="relative">
          {preview ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <img src={preview} alt="Food preview" className="w-full h-64 object-cover rounded-xl shadow-lg" />
              {isLoading ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                  <div className="text-center text-white">
                    <LoadingSpinner size="lg" />
                    <p className="mt-2 font-medium">Analyzing food with AI...</p>
                    <p className="text-sm opacity-75">This may take a few seconds</p>
                  </div>
                </div>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={handleCameraClick}
              className="w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:from-blue-100 hover:to-indigo-200 transition-all duration-200"
            >
              <Camera size={64} className="text-blue-500 mb-4" />
              <span className="text-gray-700 font-semibold text-lg">Take a photo of your food</span>
              <span className="text-sm text-gray-500 mt-2 px-4 text-center">Point camera at your meal and tap</span>
            </motion.div>
          )}
        </div>

        {error ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">Analysis failed</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <Button variant="secondary" size="sm" onClick={resetScan} className="mt-2">
              Try Again
            </Button>
          </motion.div>
        ) : null}

        {result && !isLoading ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-6 shadow-lg border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl text-gray-800">{result.name}</h3>
                <p className="text-sm text-gray-500">Confidence: {Math.round((result.confidence ?? 0.6) * 100)}%</p>
              </div>
              <button onClick={() => setEditMode((v) => !v)} className="p-2 text-blue-600 bg-blue-50 rounded-lg" aria-label="Edit">
                <Edit3 size={18} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
              <div className="grid grid-cols-4 gap-2">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedMealType === type ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">
                  {editMode ? (
                    <Input
                      type="number"
                      value={editedFood.calories ?? result.calories}
                      onChange={(e) => setEditedFood((p) => ({ ...p, calories: Number(e.target.value) }))}
                      className="w-24 text-center border-blue-300"
                    />
                  ) : (
                    result.calories
                  )}
                </div>
                <div className="text-sm text-blue-600 font-medium">Calories</div>
                <div className="text-xs text-gray-500">per 100g</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="text-2xl font-bold text-green-700">{result.healthScore}/10</div>
                <div className="text-sm text-green-600 font-medium">Health Score</div>
                <div className="text-xs text-gray-500">AI assessment</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Macronutrients (per 100g)</h4>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: "protein", label: "Protein", bg: "bg-red-50", text: "text-red-700", border: "border-red-300" },
                  { key: "carbs", label: "Carbs", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300" },
                  { key: "fat", label: "Fat", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300" }
                ] as const).map(({ key, label, bg, text, border }) => (
                  <div key={key} className={`text-center p-3 ${bg} rounded-lg`}>
                    <div className={`text-lg font-bold ${text}`}>
                      {editMode ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={(editedFood as any)[key] ?? (result as any)[key]}
                          onChange={(e) => setEditedFood((p) => ({ ...p, [key]: Number(e.target.value) }))}
                          className={`w-20 text-center ${border}`}
                        />
                      ) : (
                        `${(result as any)[key]}g`
                      )}
                    </div>
                    <div className="text-sm text-gray-700 font-medium">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portion Size (grams)</label>
              <Input
                type="number"
                value={editedFood.portionSize ?? result.portionSize}
                onChange={(e) => setEditedFood((p) => ({ ...p, portionSize: Number(e.target.value) }))}
              />
              <p className="text-sm text-gray-500 mt-1">
                Total calories:{" "}
                {Math.round(((editedFood.calories ?? result.calories) * (editedFood.portionSize ?? result.portionSize)) / 100)}
              </p>
            </div>

            {result.aiSuggestions ? (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                <div className="font-semibold text-yellow-800 mb-1">AI Nutritionist Says</div>
                <div className="text-sm text-yellow-700">{result.aiSuggestions}</div>
              </div>
            ) : null}

            {result.alternatives?.length ? (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Healthier Alternatives</h4>
                <div className="space-y-2">
                  {result.alternatives.map((alternative, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-800">{alternative}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex space-x-3 pt-4">
              <Button variant="primary" onClick={() => setShowConfirmModal(true)} className="flex-1 py-3 font-semibold" disabled={isLoading}>
                <Check size={18} className="mr-2" />
                Log This Meal
              </Button>
              <Button variant="secondary" onClick={resetScan} className="px-6 py-3">
                Scan Again
              </Button>
            </div>
          </motion.div>
        ) : null}

        <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Food Log">
          <div className="space-y-4">
            <p className="text-gray-700">
              Log <strong>{result?.name}</strong> as your {selectedMealType}?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">
                <div>
                  Calories:{" "}
                  {Math.round(((editedFood.calories ?? result?.calories ?? 0) * (editedFood.portionSize ?? result?.portionSize ?? 0)) / 100)}
                </div>
                <div>Portion: {editedFood.portionSize ?? result?.portionSize}g</div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="primary" onClick={handleLogFood} className="flex-1">
                Yes, Log It
              </Button>
              <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

