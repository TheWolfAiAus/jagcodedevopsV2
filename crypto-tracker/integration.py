import json
import logging
import os
from datetime import datetime
from typing import Dict, List, Any

import ccxt
import numpy as np
import pandas as pd
import requests
from dotenv import load_dotenv
from sklearn.preprocessing import MinMaxScaler
from ta.momentum import RSIIndicator, StochasticOscillator
from ta.trend import SMAIndicator, EMAIndicator, MACD
from ta.volatility import BollingerBands
from ta.volume import OnBalanceVolumeIndicator

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("crypto_analysis.log")
    ]
)
logger = logging.getLogger("crypto-analysis")

# API Configuration
COINGECKO_API_KEY = os.environ.get('COINGECKO_API_KEY')
COINGECKO_BASE_URL = 'https://pro-api.coingecko.com/api/v3'

# Initialize exchange clients
default_exchange_config = {
    'enableRateLimit': True,
    'timeout': 30000,
}

class CryptoAnalysis:
    """Class for cryptocurrency market data analysis"""

    def __init__(self):
        """Initialize the crypto analysis module"""
        self.exchanges = {
            'binance': ccxt.binance(default_exchange_config),
            'coinbase': ccxt.coinbase(default_exchange_config),
            'kraken': ccxt.kraken(default_exchange_config),
        }
        self.scaler = MinMaxScaler(feature_range=(0, 1))

    def fetch_historical_data(self, symbol: str, timeframe: str = '1d', limit: int = 100) -> pd.DataFrame:
        """Fetch historical OHLCV data for a specific cryptocurrency

        Args:
            symbol: The trading pair symbol (e.g., 'BTC/USDT')
            timeframe: The timeframe for data (e.g., '1h', '1d')
            limit: Number of candles to retrieve

        Returns:
            DataFrame with historical price data
        """
        try:
            # Try to fetch from multiple exchanges, use the first successful one
            for exchange_name, exchange in self.exchanges.items():
                try:
                    logger.info(f"Fetching {symbol} data from {exchange_name}")
                    ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)

                    # Convert to DataFrame
                    df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
                    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
                    df.set_index('timestamp', inplace=True)

                    logger.info(f"Successfully fetched {len(df)} candles from {exchange_name}")
                    return df
                except Exception as e:
                    logger.warning(f"Error fetching from {exchange_name}: {e}")
                    continue

            # If all exchanges failed, try CoinGecko as fallback
            return self._fetch_from_coingecko(symbol, days=limit)

        except Exception as e:
            logger.error(f"Error fetching historical data: {e}")
            return pd.DataFrame()

    def _fetch_from_coingecko(self, symbol: str, days: int = 100) -> pd.DataFrame:
        """Fetch historical price data from CoinGecko API

        Args:
            symbol: The cryptocurrency symbol (e.g., 'BTC')
            days: Number of days of data to retrieve

        Returns:
            DataFrame with historical price data
        """
        try:
            # Extract coin ID from symbol
            coin = symbol.split('/')[0].lower() if '/' in symbol else symbol.lower()

            # Get coin ID first
            params = {
                'x_cg_pro_api_key': COINGECKO_API_KEY
            }
            response = requests.get(f"{COINGECKO_BASE_URL}/coins/list", params=params, timeout=30)
            response.raise_for_status()
            coins_list = response.json()

            # Find the coin ID
            coin_id = None
            for c in coins_list:
                if c['symbol'].lower() == coin:
                    coin_id = c['id']
                    break

            if not coin_id:
                logger.error(f"Could not find coin ID for {symbol}")
                return pd.DataFrame()

            # Get market data
            params = {
                'vs_currency': 'usd',
                'days': days,
                'interval': 'daily',
                'x_cg_pro_api_key': COINGECKO_API_KEY
            }
            response = requests.get(f"{COINGECKO_BASE_URL}/coins/{coin_id}/market_chart", params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            # Process price data
            prices = data['prices']
            volumes = data['total_volumes']

            # Create DataFrame
            df = pd.DataFrame(prices, columns=['timestamp', 'close'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')

            # Add volume data
            vol_df = pd.DataFrame(volumes, columns=['timestamp', 'volume'])
            vol_df['timestamp'] = pd.to_datetime(vol_df['timestamp'], unit='ms')
            df = pd.merge(df, vol_df, on='timestamp')

            # Fill in missing OHLC data (CoinGecko only provides close prices)
            df['open'] = df['close'].shift(1)
            df['high'] = df['close'] * 1.005  # Approximate
            df['low'] = df['close'] * 0.995   # Approximate
            df.iloc[0, df.columns.get_loc('open')] = df.iloc[0, df.columns.get_loc('close')]

            df.set_index('timestamp', inplace=True)

            logger.info(f"Successfully fetched {len(df)} days of data from CoinGecko")
            return df

        except Exception as e:
            logger.error(f"Error fetching data from CoinGecko: {e}")
            return pd.DataFrame()

    def calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators for the given price data

        Args:
            df: DataFrame containing OHLCV data

        Returns:
            DataFrame with added technical indicators
        """
        if df.empty:
            return df

        try:
            # Make a copy to avoid modifying the original
            result = df.copy()

            # Moving Averages
            result['sma_20'] = SMAIndicator(close=result['close'], window=20).sma_indicator()
            result['sma_50'] = SMAIndicator(close=result['close'], window=50).sma_indicator()
            result['ema_12'] = EMAIndicator(close=result['close'], window=12).ema_indicator()
            result['ema_26'] = EMAIndicator(close=result['close'], window=26).ema_indicator()

            # MACD
            macd = MACD(close=result['close'], window_slow=26, window_fast=12, window_sign=9)
            result['macd'] = macd.macd()
            result['macd_signal'] = macd.macd_signal()
            result['macd_histogram'] = macd.macd_diff()

            # RSI
            result['rsi_14'] = RSIIndicator(close=result['close'], window=14).rsi()

            # Bollinger Bands
            bollinger = BollingerBands(close=result['close'], window=20, window_dev=2)
            result['bollinger_mavg'] = bollinger.bollinger_mavg()
            result['bollinger_high'] = bollinger.bollinger_hband()
            result['bollinger_low'] = bollinger.bollinger_lband()

            # Stochastic Oscillator
            stoch = StochasticOscillator(high=result['high'], low=result['low'], close=result['close'], window=14, smooth_window=3)
            result['stoch_k'] = stoch.stoch()
            result['stoch_d'] = stoch.stoch_signal()

            # OBV
            result['obv'] = OnBalanceVolumeIndicator(close=result['close'], volume=result['volume']).on_balance_volume()

            # Price rate of change
            result['price_change_1d'] = result['close'].pct_change(1) * 100
            result['price_change_7d'] = result['close'].pct_change(7) * 100

            # Volatility 
            result['volatility'] = result['close'].rolling(window=20).std() / result['close'].rolling(window=20).mean() * 100

            return result

        except Exception as e:
            logger.error(f"Error calculating technical indicators: {e}")
            return df

    def generate_signals(self, df: pd.DataFrame) -> dict[str, str] | dict[
        str, dict[str, str | float] | dict[str, str | Any] | dict[str, float] | str]:
        """Generate trading signals based on technical indicators

        Args:
            df: DataFrame with price data and technical indicators

        Returns:
            Dictionary of trading signals and strength indicators
        """
        if df.empty or len(df) < 50:
            return {'error': 'Insufficient data for analysis'}

        try:
            # Get the most recent data point
            current = df.iloc[-1]
            previous = df.iloc[-2]

            signals = {
                'trend': {
                    'short_term': 'neutral',
                    'medium_term': 'neutral',
                    'strength': 0.0
                },
                'momentum': {
                    'signal': 'neutral',
                    'strength': 0.0
                },
                'volatility': {
                    'signal': 'normal',
                    'value': current.get('volatility', 0)
                },
                'support_resistance': {
                    'support': round(float(current.get('bollinger_low', 0)), 2),
                    'resistance': round(float(current.get('bollinger_high', 0)), 2)
                },
                'recommendation': 'neutral'
            }

            # Trend signals
            if current['close'] > current['sma_20'] > current['sma_50']:
                signals['trend']['short_term'] = 'bullish'
                signals['trend']['medium_term'] = 'bullish'
                signals['trend']['strength'] = min(1.0, (current['close'] / current['sma_50'] - 1) * 5)
            elif current['close'] < current['sma_20'] < current['sma_50']:
                signals['trend']['short_term'] = 'bearish'
                signals['trend']['medium_term'] = 'bearish'
                signals['trend']['strength'] = min(1.0, (1 - current['close'] / current['sma_50']) * 5)
            elif current['close'] > current['sma_20'] and current['sma_20'] < current['sma_50']:
                signals['trend']['short_term'] = 'bullish'
                signals['trend']['medium_term'] = 'bearish'
                signals['trend']['strength'] = 0.3
            elif current['close'] < current['sma_20'] and current['sma_20'] > current['sma_50']:
                signals['trend']['short_term'] = 'bearish'
                signals['trend']['medium_term'] = 'bullish'
                signals['trend']['strength'] = 0.3

            # Momentum signals
            if current['rsi_14'] > 70:
                signals['momentum']['signal'] = 'overbought'
                signals['momentum']['strength'] = min(1.0, (current['rsi_14'] - 70) / 30)
            elif current['rsi_14'] < 30:
                signals['momentum']['signal'] = 'oversold'
                signals['momentum']['strength'] = min(1.0, (30 - current['rsi_14']) / 30)

            # MACD signals
            if current['macd'] > current['macd_signal'] and previous['macd'] <= previous['macd_signal']:
                signals['macd_crossover'] = 'bullish'
            elif current['macd'] < current['macd_signal'] and previous['macd'] >= previous['macd_signal']:
                signals['macd_crossover'] = 'bearish'
            else:
                signals['macd_crossover'] = 'none'

            # Bollinger Band signals
            bb_width = (current['bollinger_high'] - current['bollinger_low']) / current['bollinger_mavg']
            if current['close'] > current['bollinger_high']:
                signals['bollinger'] = 'upper_breakout'
            elif current['close'] < current['bollinger_low']:
                signals['bollinger'] = 'lower_breakout'
            else:
                signals['bollinger'] = 'inside'

            signals['bollinger_width'] = round(float(bb_width), 2)

            # Generate overall recommendation
            bullish_factors = 0
            bearish_factors = 0

            # Count bullish factors
            if signals['trend']['short_term'] == 'bullish': bullish_factors += 1
            if signals['trend']['medium_term'] == 'bullish': bullish_factors += 1
            if signals['momentum']['signal'] == 'oversold': bullish_factors += 1
            if signals['macd_crossover'] == 'bullish': bullish_factors += 1
            if signals['bollinger'] == 'lower_breakout': bullish_factors += 1

            # Count bearish factors
            if signals['trend']['short_term'] == 'bearish': bearish_factors += 1
            if signals['trend']['medium_term'] == 'bearish': bearish_factors += 1
            if signals['momentum']['signal'] == 'overbought': bearish_factors += 1
            if signals['macd_crossover'] == 'bearish': bearish_factors += 1
            if signals['bollinger'] == 'upper_breakout': bearish_factors += 1

            # Determine overall recommendation
            if bullish_factors >= 3 and bullish_factors > bearish_factors:
                signals['recommendation'] = 'buy'
            elif bearish_factors >= 3 and bearish_factors > bullish_factors:
                signals['recommendation'] = 'sell'
            else:
                signals['recommendation'] = 'neutral'

            return signals

        except Exception as e:
            logger.error(f"Error generating signals: {e}")
            return {'error': str(e)}

    def analyze_market_sentiment(self, symbol: str) -> Dict:
        """Analyze market sentiment for a cryptocurrency using news and social data

        Args:
            symbol: The cryptocurrency symbol (e.g., 'BTC')

        Returns:
            Dictionary with sentiment analysis results
        """
        try:
            # Extract coin name from symbol
            coin = symbol.split('/')[0].lower() if '/' in symbol else symbol.lower()

            # Fetch sentiment data from CoinGecko
            params = {
                'x_cg_pro_api_key': COINGECKO_API_KEY
            }

            # First get coin ID
            response = requests.get(f"{COINGECKO_BASE_URL}/coins/list", params=params, timeout=30)
            response.raise_for_status()
            coins_list = response.json()

            coin_id = None
            for c in coins_list:
                if c['symbol'].lower() == coin:
                    coin_id = c['id']
                    break

            if not coin_id:
                return {'error': f"Could not find coin ID for {symbol}"}

            # Get community data
            response = requests.get(f"{COINGECKO_BASE_URL}/coins/{coin_id}", params=params, timeout=30)
            response.raise_for_status()
            data = response.json()

            community_data = data.get('community_data', {})
            public_interest_stats = data.get('public_interest_stats', {})
            sentiment = data.get('sentiment_votes_up_percentage', 50)

            # Calculate community growth metrics
            twitter_followers = community_data.get('twitter_followers', 0)
            reddit_subscribers = community_data.get('reddit_subscribers', 0)

            # Calculate sentiment score
            sentiment_score = (sentiment - 50) / 50  # -1.0 to 1.0 scale

            result = {
                'symbol': symbol,
                'sentiment': {
                    'score': round(sentiment_score, 2),
                    'direction': 'bullish' if sentiment_score > 0.1 else 'bearish' if sentiment_score < -0.1 else 'neutral',
                    'strength': abs(round(sentiment_score, 2))
                },
                'community_stats': {
                    'twitter_followers': twitter_followers,
                    'reddit_subscribers': reddit_subscribers,
                },
                'public_interest': public_interest_stats.get('alexa_rank', 0)
            }

            return result

        except Exception as e:
            logger.error(f"Error analyzing market sentiment: {e}")
            return {'error': str(e)}

    def get_market_correlations(self, symbols: List[str], days: int = 30) -> Dict:
        """Calculate price correlations between different cryptocurrencies

        Args:
            symbols: List of cryptocurrency symbols
            days: Number of days to analyze

        Returns:
            Dictionary with correlation matrix and insights
        """
        try:
            # Fetch data for all symbols
            all_data = {}
            for symbol in symbols:
                df = self.fetch_historical_data(symbol, limit=days)
                if not df.empty:
                    all_data[symbol] = df['close']

            if not all_data:
                return {'error': 'Failed to fetch price data'}

            # Create a DataFrame with all close prices
            price_df = pd.DataFrame(all_data)

            # Calculate correlation matrix
            corr_matrix = price_df.corr().round(2)

            # Find highest and lowest correlations
            corr_pairs = []
            for i in range(len(symbols)):
                for j in range(i+1, len(symbols)):
                    if i != j and symbols[i] in corr_matrix.index and symbols[j] in corr_matrix.columns:
                        corr = corr_matrix.loc[symbols[i], symbols[j]]
                        corr_pairs.append((symbols[i], symbols[j], corr))

            # Sort by correlation value
            corr_pairs.sort(key=lambda x: abs(x[2]), reverse=True)

            # Format results
            result = {
                'period_days': days,
                'correlation_matrix': corr_matrix.to_dict(),
                'highest_correlations': [
                    {'pair': f"{pair[0]}/{pair[1]}", 'correlation': pair[2]}
                    for pair in corr_pairs[:5]  # Top 5 highest correlations
                ],
                'lowest_correlations': [
                    {'pair': f"{pair[0]}/{pair[1]}", 'correlation': pair[2]}
                    for pair in sorted(corr_pairs, key=lambda x: abs(x[2]))[:5]  # Top 5 lowest correlations
                ]
            }

            return result

        except Exception as e:
            logger.error(f"Error calculating market correlations: {e}")
            return {'error': str(e)}

    def analyze_crypto(self, symbol: str) -> Dict:
        """Perform comprehensive analysis for a cryptocurrency

        Args:
            symbol: The cryptocurrency symbol (e.g., 'BTC/USDT')

        Returns:
            Dictionary with analysis results
        """
        try:
            # Make sure symbol is properly formatted
            if '/' not in symbol:
                symbol = f"{symbol}/USDT"

            # Fetch historical data
            df = self.fetch_historical_data(symbol, timeframe='1d', limit=100)

            if df.empty:
                return {'error': f"Failed to fetch data for {symbol}"}

            # Calculate technical indicators
            df_with_indicators = self.calculate_technical_indicators(df)

            # Generate trading signals
            signals = self.generate_signals(df_with_indicators)

            # Get market sentiment
            sentiment = self.analyze_market_sentiment(symbol.split('/')[0])

            # Current price metrics
            current_price = df['close'].iloc[-1]
            price_change_24h = df['close'].iloc[-1] / df['close'].iloc[-2] - 1 if len(df) > 1 else 0
            price_change_7d = df['close'].iloc[-1] / df['close'].iloc[-7] - 1 if len(df) > 7 else 0
            price_change_30d = df['close'].iloc[-1] / df['close'].iloc[-30] - 1 if len(df) > 30 else 0

            # Volatility calculation
            volatility_30d = df['close'].pct_change().rolling(window=30).std() * np.sqrt(365) * 100
            current_volatility = volatility_30d.iloc[-1] if not volatility_30d.empty else 0

            # Compile results
            analysis_result = {
                'symbol': symbol,
                'timestamp': datetime.now().isoformat(),
                'price': {
                    'current': round(float(current_price), 8),
                    'change_24h_percent': round(float(price_change_24h * 100), 2),
                    'change_7d_percent': round(float(price_change_7d * 100), 2),
                    'change_30d_percent': round(float(price_change_30d * 100), 2),
                    'volatility_annual_percent': round(float(current_volatility), 2)
                },
                'technical_analysis': signals,
                'market_sentiment': sentiment,
                'summary': {
                    'recommendation': signals.get('recommendation', 'neutral'),
                    'risk_level': 'high' if current_volatility > 100 else 'medium' if current_volatility > 50 else 'low',
                    'trend_strength': signals.get('trend', {}).get('strength', 0),
                    'sentiment_direction': sentiment.get('sentiment', {}).get('direction', 'neutral')
                }
            }

            return analysis_result

        except Exception as e:
            logger.error(f"Error analyzing crypto: {e}")
            return {'error': str(e)}

# Function to run a sample analysis
def run_sample_analysis():
    """Run a sample analysis on Bitcoin and Ethereum"""
    try:
        analyzer = CryptoAnalysis()

        # Analyze Bitcoin
        btc_analysis = analyzer.analyze_crypto('BTC/USDT')
        logger.info(f"Bitcoin analysis complete: {json.dumps(btc_analysis, indent=2)}")

        # Analyze Ethereum
        eth_analysis = analyzer.analyze_crypto('ETH/USDT')
        logger.info(f"Ethereum analysis complete: {json.dumps(eth_analysis, indent=2)}")

        # Calculate correlations
        correlations = analyzer.get_market_correlations(['BTC/USDT', 'ETH/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT'])
        logger.info(f"Market correlations calculated: {json.dumps(correlations, indent=2)}")

        return {
            'btc': btc_analysis,
            'eth': eth_analysis,
            'correlations': correlations
        }

    except Exception as e:
        logger.error(f"Error running sample analysis: {e}")
        return {'error': str(e)}

# Main module execution
if __name__ == "__main__":
    logging.info("Crypto Analysis module loaded successfully")

    # Run a sample analysis
    result = run_sample_analysis()

    logger.info("Sample analysis completed")
