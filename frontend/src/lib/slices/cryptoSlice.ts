import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CryptoData {
  bitcoin_price: number
  ethereum_price: number
  solana_price: number
  last_updated: string
}

interface CryptoState {
  data: CryptoData | null
  isLoading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: CryptoState = {
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
}

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    setCryptoData: (state, action: PayloadAction<CryptoData>) => {
      state.data = action.payload
      state.lastUpdated = new Date().toISOString()
      state.isLoading = false
      state.error = null
    },
    setCryptoLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setCryptoError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearCryptoError: (state) => {
      state.error = null
    },
  },
})

export const { 
  setCryptoData, 
  setCryptoLoading, 
  setCryptoError, 
  clearCryptoError 
} = cryptoSlice.actions

export default cryptoSlice.reducer