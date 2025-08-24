import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Transaction {
  $id: string
  userId: string
  type: string
  amount: number
  symbol: string
  network: string
  hash: string
  status: string
  timestamp: string
}

interface PortfolioHolding {
  symbol: string
  amount: number
  value: number
  price: number
}

interface PortfolioState {
  holdings: PortfolioHolding[]
  transactions: Transaction[]
  totalValue: number
  isLoading: boolean
  error: string | null
}

const initialState: PortfolioState = {
  holdings: [],
  transactions: [],
  totalValue: 0,
  isLoading: false,
  error: null,
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setPortfolioHoldings: (state, action: PayloadAction<PortfolioHolding[]>) => {
      state.holdings = action.payload
      state.totalValue = action.payload.reduce((total, holding) => total + holding.value, 0)
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload)
    },
    setPortfolioLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setPortfolioError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearPortfolioError: (state) => {
      state.error = null
    },
  },
})

export const {
  setPortfolioHoldings,
  setTransactions,
  addTransaction,
  setPortfolioLoading,
  setPortfolioError,
  clearPortfolioError,
} = portfolioSlice.actions

export default portfolioSlice.reducer