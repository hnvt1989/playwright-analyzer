import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { RootState } from "../store";
import { setTestResult } from "../store/testResultSlice";
import {
  extractFailedTests,
  exportFailuresToCSV,
  downloadCSV,
  predictFlakinessForFailures
} from "../utils/extractErrors";

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const testResult = useSelector((state: RootState) => state.testResult.result);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated") === "true";
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        dispatch(setTestResult(json));
        const result = extractFailedTests(json);
        const enriched = await predictFlakinessForFailures(result.failures);
        setAnalysis({ ...result, failures: enriched });
      } catch (err) {
        console.error("Failed to parse JSON", err);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadCSV = () => {
    if (!analysis?.failures?.length) return;
    const csv = exportFailuresToCSV(analysis.failures);
    downloadCSV(csv);
  };

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    router.push("/login");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Playwright Test Result Analyzer</h1>
        <button
          className="text-sm text-red-600 underline hover:text-red-800"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      <label className="block w-full">
        <span className="sr-only">Choose test result file</span>
        <input
          type="file"
          accept=".json"
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
          onChange={handleFileChange}
        />
      </label>

      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 transition"
        onClick={handleAnalyze}
      >
        Analyze
      </button>

      {analysis && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-800">Test Summary</h2>
          <p className="text-sm text-gray-600">Run Duration: {analysis.run_duration_ms} ms</p>

          <div className="mt-4 flex justify-end">
            <button
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={handleDownloadCSV}
            >
              Download CSV
            </button>
          </div>

          <h3 className="text-md font-semibold mt-4 text-red-600">Failures:</h3>
          {analysis.failures.length === 0 && (
            <p className="text-sm text-green-600">No failures 🎉</p>
          )}
          {analysis.failures.map((fail: any, index: number) => (
            <div key={index} className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
              <p><strong>File:</strong> {fail.file}</p>
              <p><strong>Test:</strong> {fail.title}</p>
              <p><strong>Line:</strong> {fail.line ?? "Unknown"}</p>
              <p><strong>Message:</strong> {fail.message}</p>
              <p className={`text-sm font-semibold ${fail.flaky ? "text-yellow-600" : "text-green-700"}`}>
                Prediction: {fail.flaky === undefined ? "?" : fail.flaky ? "Flaky" : "Stable"}
              </p>
              <pre className="mt-2 text-xs text-gray-600">{fail.stack}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
