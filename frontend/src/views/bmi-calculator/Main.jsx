import { useState } from "react";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
export default function BMICalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBMI] = useState(null);
  const [suggestion, setSuggestion] = useState("");

  const calculateBMI = () => {
    if (!weight || !height) return;
    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    setBMI(bmiValue);
    generateAISuggestion(bmiValue);
  };

  const generateAISuggestion = (bmi) => {
    if (bmi < 18.5) {
      setSuggestion(
        "You are underweight. Consider eating a balanced diet with more protein and calories."
      );
    } else if (bmi >= 18.5 && bmi < 24.9) {
      setSuggestion(
        "You have a healthy weight. Maintain a balanced diet and regular exercise."
      );
    } else if (bmi >= 25 && bmi < 29.9) {
      setSuggestion(
        "You are overweight. Consider a diet plan with exercise to stay fit."
      );
    } else {
      setSuggestion(
        "You are obese. A structured workout and diet plan might help in reducing weight."
      );
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center 
     p-4"
    >
      {" "}
      <DarkModeSwitcher />
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">BMI Calculator</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Weight (kg):</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Enter weight in kg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Height (cm):</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mt-1"
            placeholder="Enter height in cm"
          />
        </div>
        <button
          onClick={calculateBMI}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          AI Summary
        </button>
        {bmi && (
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold">Your BMI: {bmi}</p>
            <p className="text-gray-700 mt-2">{suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
}
