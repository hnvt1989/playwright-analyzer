
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TestResultState {
  result: any;
}

const initialState: TestResultState = {
  result: null,
};

const testResultSlice = createSlice({
  name: 'testResult',
  initialState,
  reducers: {
    setTestResult(state, action: PayloadAction<any>) {
      state.result = action.payload;
    },
  },
});

export const { setTestResult } = testResultSlice.actions;
export default testResultSlice.reducer;
