import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setTestResult } from "../store/testResultSlice";

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const testResult = useSelector((state: RootState) => state.testResult.result);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        dispatch(setTestResult(json));
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Playwright Test Result Analyzer</h1>
      <input type="file" accept=".json" onChange={handleFileChange} className="block mb-4" />
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAnalyze}>
        Analyze
      </button>

      {testResult && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p>Total Tests: {testResult.suites?.length || 0}</p>
          <pre className="mt-4 p-2 text-sm overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;
