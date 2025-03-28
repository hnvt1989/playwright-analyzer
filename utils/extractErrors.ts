// utils/extractErrors.ts

interface Failure {
    file: string;
    title: string;
    line: number | null;
    message: string;
    stack: string;
  }
  
  interface ExtractedResult {
    run_duration_ms: number;
    failures: Failure[];
  }
  
  interface TestSuite {
    file: string;
    duration?: number;
    tests?: TestCase[];
  }
  
  interface TestCase {
    title: string;
    status: string;
    duration?: number;
    error?: {
      message?: string;
      stack?: string;
    };
  }
  
  const extractFailedTests = (data: { suites?: TestSuite[] }): ExtractedResult => {
    const result: ExtractedResult = {
      run_duration_ms: 0,
      failures: []
    };
  
    let totalDuration = 0;
  
    for (const suite of data.suites || []) {
      totalDuration += suite.duration || 0;
  
      for (const test of suite.tests || []) {
        if (test.status === "failed") {
          const stack = test.error?.stack || "";
          const match = stack.match(/(\w+\.ts):(\d+):(\d+)/);
  
          result.failures.push({
            file: suite.file,
            title: test.title,
            line: match ? parseInt(match[2], 10) : null,
            message: test.error?.message || "",
            stack: stack
          });
        }
      }
    }
  
    result.run_duration_ms = totalDuration;
    return result;
  };
  
  const exportFailuresToCSV = (failures: Failure[]): string => {
    const headers = ["file", "title", "line", "message"];
    const csvRows = [headers.join(",")];
  
    for (const fail of failures) {
      const row = headers.map((key) => {
        const value = (fail as Record<string, any>)[key] || "";
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(row.join(","));
    }
  
    return csvRows.join("\n");
  };
  
  const downloadCSV = (csvData: string, filename = "failed-tests.csv") => {
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  export { extractFailedTests, exportFailuresToCSV, downloadCSV };
  