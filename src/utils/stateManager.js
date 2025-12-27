// src/utils/stateManager.js

// This file can be used to implement global state management.
// Depending on the complexity and needs of the application, you could use:
// 1. React Context API
// 2. Redux / Zustand / Jotai for more complex state
// 3. Simple custom hooks for local component state sharing

// Example using a simple observer pattern or custom hook setup:

const subscribers = [];
let globalState = {};

export const getGlobalState = () => globalState;

export const setGlobalState = (newState) => {
  globalState = { ...globalState, ...newState };
  subscribers.forEach(callback => callback(globalState));
};

export const subscribeToState = (callback) => {
  subscribers.push(callback);
  return () => { // Unsubscribe function
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
};

// Initialize with some default state if needed
setGlobalState({
  user: null,
  isLoading: false,
  error: null,
});
