import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import cryptoReducer from './slices/cryptoSlice'
import portfolioReducer from './slices/portfolioSlice'

const persistConfig = {
  key: 'jagcodedeveops',
  storage,
  whitelist: ['auth', 'portfolio']
}

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    crypto: cryptoReducer,
    portfolio: portfolioReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch