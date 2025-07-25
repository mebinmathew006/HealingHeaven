import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage
import UserDetailsSlice from './UserDetailsSlice';
import SocketSlice from './socketSlice';
import notificationSlice from './notificationSlice';
import { combineReducers } from 'redux';

// 1. Create persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['userDetails','socketDetails'], // specify which reducers to persist
};

// 2. Combine reducers
const rootReducer = combineReducers({
  userDetails: UserDetailsSlice,
  socketDetails: SocketSlice,
  notificationDetails: notificationSlice,
});

// 3. Wrap with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // disable check for redux-persist
    }),
});

// 5. Create persistor
export const persistor = persistStore(store);

export default store;
