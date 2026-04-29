import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Plus, Target } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../common/Button";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { CreatePlanModal } from "../features/CreatePlanModal";
import { usePlanStore } from "../../store/planStore";
import { useUserStore } from "../../store/userStore";

export const PlanScreen: React.FC = () => {
  const { plans, activePlan, isLoading, fetchPlans, generatePlan } = usePlanStore();
  const { user } = useUserStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const stats = useMemo(() => {
    const dailyGoal = user?.caloriesGoal ?? 2000;
    const budget = user?.budget ?? 50;
    return { dailyGoal, budget };
  }, [user]);

  const handleGenerateQuickPlan = async () => {
    const preferences = {
      name: "AI Quick Plan",
      duration: 7,
      calorieGoal: stats.dailyGoal,
      dietType: user?.dietType ?? "balanced",
      budget: stats.budget,
      excludeIngredients: user?.allergies ?? []
    };
    await generatePlan(preferences);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Meal Plans</h1>
          <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)} className="flex items-center">
            <Plus size={16} className="mr-1" />
            Create Plan
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {!activePlan ? (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Get Started with AI</h2>
            <p className="mb-4 opacity-90">Let our AI create a personalized meal plan for you in seconds</p>
            <Button variant="secondary" onClick={handleGenerateQuickPlan} className="bg-white text-blue-600 hover:bg-gray-100">
              <Target size={16} className="mr-2" />
              Generate AI Plan
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Active Plan</h2>
              <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">Active</div>
            </div>
            <pre className="text-xs bg-slate-50 border rounded-lg p-3 overflow-auto">
              {JSON.stringify(activePlan.meals, null, 2)}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-800">{plans.length}</div>
            <div className="text-sm text-gray-600">Total Plans</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-800">{stats.dailyGoal}</div>
            <div className="text-sm text-gray-600">Daily Goal</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="w-6 h-6 text-purple-500 mx-auto mb-2 font-bold">$</div>
            <div className="text-lg font-bold text-gray-800">${stats.budget}</div>
            <div className="text-sm text-gray-600">Daily Budget</div>
          </div>
        </div>

        {plans.length ? (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">All Plans</h2>
            <div className="space-y-3">
              {plans.map((plan) => (
                <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="font-semibold text-gray-800">{plan.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(plan.startDate).toLocaleDateString()} → {new Date(plan.endDate).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No meal plans yet</h3>
            <p className="text-gray-600 mb-6">Create your first meal plan to get started</p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Plan
            </Button>
          </div>
        )}
      </div>

      <CreatePlanModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
};

