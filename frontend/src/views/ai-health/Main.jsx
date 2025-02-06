import React, { useState } from "react";
import { APP_NAME } from "../../utils/constants";
import logoUrl from "@/assets/images/logo.png";
import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
import { saveHealthyBMIProofService } from "../../services/blockchain.services";

const LeaderBoard = () => {
  const checkHealthSummary = async () => {
    if (!weight || !height) return;
    const response = await saveHealthyBMIProofService({
      weightInKg: weight,
      heightInCm: height,
    });

    setSuggestion(response);
  };
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [suggestion, setSuggestion] = useState("");
  return (
    <div className="min-h-screen flex flex-col items-center  p-4">
      <DarkModeSwitcher />
      <h2 className="text-3xl font-bold text-white mb-4 flex flex-col items-center">
        <a href="/" className="flex items-center space-x-3">
          <img alt={APP_NAME} className="w-10" src={logoUrl} />
          <span className="text-lg">{APP_NAME} AI Health Advisor</span>
        </a>
      </h2>

      <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
        <div className="mb-4">
          <label className="block text-black">Weight (kg):</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border rounded mt-1"
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
          onClick={checkHealthSummary}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          AI Summary
        </button>
        {suggestion && (
          <div className="mt-4 text-center">
            <p className="text-gray-700 mt-2">{suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderBoard;

// import { useState } from "react";
// import DarkModeSwitcher from "@/components/dark-mode-switcher/Main";
// import { saveHealthyBMIProofService } from "../../services/blockchain.services";
// export default function BMICalculator() {
//   const [weight, setWeight] = useState("");
//   const [height, setHeight] = useState("");
//   const [suggestion, setSuggestion] = useState("");

//   const checkHealthSummary = async () => {
//     if (!weight || !height) return;
//     const response = await saveHealthyBMIProofService({
//       weightInKg: weight,
//       heightInCm: height,
//     });

//     console.log(response);
//     // const heightInMeters = height / 100;
//     // const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(2);
//     // setBMI(bmiValue);
//     // generateAISuggestion(bmiValue);
//   };

//   return (
//     <div
//       className="min-h-screen flex flex-col items-center justify-center
//      p-4"
//     >
//       {" "}
//       <DarkModeSwitcher />
//       <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
//         <h1 className="text-2xl font-bold mb-4 text-center text-black">
//           AI Health Advisor
//         </h1>
//         <div className="mb-4">
//           <label className="block text-black">Weight (kg):</label>
//           <input
//             type="number"
//             value={weight}
//             onChange={(e) => setWeight(e.target.value)}
//             className="w-full p-2 border rounded mt-1"
//             placeholder="Enter weight in kg"
//           />
//         </div>
//         <div className="mb-4">
//           <label className="block text-gray-700">Height (cm):</label>
//           <input
//             type="number"
//             value={height}
//             onChange={(e) => setHeight(e.target.value)}
//             className="w-full p-2 border border-gray-300 rounded mt-1"
//             placeholder="Enter height in cm"
//           />
//         </div>
//         <button
//           onClick={checkHealthSummary}
//           className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
//         >
//           AI Summary
//         </button>
//         {suggestion && (
//           <div className="mt-4 text-center">
//             <p className="text-gray-700 mt-2">{suggestion}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
