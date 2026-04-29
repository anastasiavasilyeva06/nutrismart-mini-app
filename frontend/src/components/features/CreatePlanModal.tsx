import React, { useState } from "react";
import { Clock, DollarSign, Target, Utensils } from "lucide-react";
import { usePlanStore } from "../../store/planStore";
import { useUserStore } from "../../store/userStore";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Modal } from "../common/Modal";
import { LoadingSpinner } from "../common/LoadingSpinner";

export const CreatePlanModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { generatePlan, isLoading } = usePlanStore();
  const { user } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    duration: 7,
    calorieGoal: user?.caloriesGoal ?? 2000,
    dietType: user?.dietType ?? "balanced",
    budget: user?.budget ?? 50,
    excludeIngredients: (user?.allergies ?? []).join(", ")
  });

  const dietTypes = [
    { value: "balanced", label: "Balanced Diet", emoji: "🥗" },
    { value: "keto", label: "Ketogenic", emoji: "🥑" },
    { value: "paleo", label: "Paleo", emoji: "🥩" },
    { value: "vegetarian", label: "Vegetarian", emoji: "🌱" },
    { value: "vegan", label: "Vegan", emoji: "🌿" },
    { value: "mediterranean", label: "Mediterranean", emoji: "🫒" }
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generatePlan({
      name: formData.name,
      duration: Number(formData.duration),
      calorieGoal: Number(formData.calorieGoal),
      dietType: formData.dietType,
      budget: Number(formData.budget),
      excludeIngredients: formData.excludeIngredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Meal Plan">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g., Weight Loss Plan"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
            <div className="relative">
              <Clock size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData((p) => ({ ...p, duration: Number(e.target.value) }))}
                min={1}
                max={30}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Calories</label>
            <div className="relative">
              <Target size={18} className="absolute left-3 top-3 text-gray-400" />
              <Input
                type="number"
                value={formData.calorieGoal}
                onChange={(e) => setFormData((p) => ({ ...p, calorieGoal: Number(e.target.value) }))}
                min={1000}
                max={5000}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Diet Type</label>
          <div className="grid grid-cols-2 gap-2">
            {dietTypes.map((diet) => (
              <button
                key={diet.value}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, dietType: diet.value }))}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  formData.dietType === diet.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{diet.emoji}</span>
                  <span className="font-medium text-sm">{diet.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Daily Budget ($)</label>
          <div className="relative">
            <DollarSign size={18} className="absolute left-3 top-3 text-gray-400" />
            <Input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData((p) => ({ ...p, budget: Number(e.target.value) }))}
              min={10}
              max={200}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Exclude Ingredients</label>
          <Input
            type="text"
            value={formData.excludeIngredients}
            onChange={(e) => setFormData((p) => ({ ...p, excludeIngredients: e.target.value }))}
            placeholder="e.g., nuts, dairy, gluten"
          />
          <p className="text-xs text-gray-500 mt-1">Separate multiple ingredients with commas</p>
        </div>

        <div className="flex space-x-3 pt-2">
          <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Generating...</span>
              </>
            ) : (
              <>
                <Utensils size={18} className="mr-2" />
                Generate Plan
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

