export const actionSchema = [
  {
    "name": "monitor_darknet_marketplace",
    "description": "Scans specified darknet marketplaces for product listings, pricing shifts, and seller reputations to uncover niche opportunities.",
    "parameters": {
      "type": "object",
      "properties": {
        "marketplaces": {
          "type": "array",
          "items": { "type": "string" },
          "description": "URLs or onion addresses of target marketplaces"
        },
        "keywords": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Search terms to filter listings (e.g., ‘crypto mixer’, ‘bulk logs’)"
        },
        "updateFrequency": {
          "type": "string",
          "description": "Interval for rescanning (e.g., ‘hourly’, ‘daily’)"
        }
      },
      "required": ["marketplaces", "keywords", "updateFrequency"]
    }
  },
  {
    "name": "discover_tor_hidden_services",
    "description": "Performs active enumeration of Tor hidden-service directories to build a map of new .onion sites and their metadata.",
    "parameters": {
      "type": "object",
      "properties": {
        "entryRelays": {
          "type": "array",
          "items": { "type": "string" },
          "description": "List of Tor entry nodes or bootstrap relays"
        },
        "depth": {
          "type": "integer",
          "description": "Number of hops to follow when crawling service directories"
        },
        "focusCategories": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Categories to prioritize (e.g., ‘marketplace’, ‘forum’, ‘pastebin’)"
        }
      },
      "required": ["entryRelays", "depth"]
    }
  },
  {
    "name": "analyze_crypto_mixing_trends",
    "description": "Aggregates blockchain transaction patterns to identify mixing services usage, volumes, and potential taint flows.",
    "parameters": {
      "type": "object",
      "properties": {
        "walletAddresses": {
          "type": "array",
          "items": { "type": "string" },
          "description": "List of source or destination crypto wallet addresses to trace"
        },
        "chains": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Blockchain networks to inspect (e.g., ‘btc’, ‘eth’, ‘zec’)"
        },
        "timeWindow": {
          "type": "string",
          "description": "Time range for analysis (e.g., ‘last_30_days’)"
        }
      },
      "required": ["walletAddresses", "chains", "timeWindow"]
    }
  },
  {
    "name": "identify_privacy_vulnerabilities",
    "description": "Runs a multilayered scan of web applications and APIs to flag under-documented endpoints and privacy leaks.",
    "parameters": {
      "type": "object",
      "properties": {
        "targetDomains": {
          "type": "array",
          "items": { "type": "string" },
          "description": "List of domains or IPs to scan"
        },
        "scanDepth": {
          "type": "integer",
          "description": "Level of recursive crawling or API probing"
        },
        "severityThreshold": {
          "type": "string",
          "enum": ["low", "medium", "high"],
          "description": "Minimum risk score to report"
        }
      },
      "required": ["targetDomains", "scanDepth", "severityThreshold"]
    }
  },
  {
    "name": "exploit_surface_analysis",
    "description": "Performs non-invasive enumeration of software components to reveal ambiguous features or misconfigurations ripe for creative leverage.",
    "parameters": {
      "type": "object",
      "properties": {
        "repoUrl": { "type": "string", "description": "Git repository URL of the target codebase" },
        "modules": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Specific modules or packages to inspect"
        },
        "analysisDepth": {
          "type": "integer",
          "description": "Call-graph or dependency traversal depth"
        }
      },
      "required": ["repoUrl", "analysisDepth"]
    }
  },
  {
    "name": "scrape_competitor_email_campaigns",
    "description": "Harvests public email signup forms, newsletter archives, and teaser campaigns to reverse-engineer competitor drip sequences.",
    "parameters": {
      "type": "object",
      "properties": {
        "domains": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Competitor domains to target"
        },
        "depth": {
          "type": "integer",
          "description": "Number of follow-up emails to fetch per signup"
        },
        "emailParserRules": {
          "type": "object",
          "additionalProperties": { "type": "string" },
          "description": "Regex patterns or selectors for extracting relevant newsletter content"
        }
      },
      "required": ["domains", "depth"]
    }
  },
  {
    "name": "market_signal_noise_discriminator",
    "description": "Ingests social-media or forum chatter to distinguish actionable alpha signals from background noise using sentiment & frequency analysis.",
    "parameters": {
      "type": "object",
      "properties": {
        "sources": {
          "type": "array",
          "items": { "type": "string" },
          "description": "APIs or RSS feeds to pull data from (e.e., ‘twitter’, ‘reddit’)"
        },
        "keywords": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Market-related terms or tickers to monitor"
        },
        "thresholdScore": {
          "type": "number",
          "description": "Minimum sentiment-frequency ratio to flag as signal"
        }
      },
      "required": ["sources", "keywords", "thresholdScore"]
    }
  },
  {
    "name": "generate_deepfake_audio_sample",
    "description": "Creates a short voice clip from provided text in a target’s voice profile for testing watermarking or authenticity detection.",
    "parameters": {
      "type": "object",
      "properties": {
        "targetVoiceSample": {
          "type": "string",
          "description": "URL or base64 of a few seconds of target’s original voice"
        },
        "textPrompt": { "type": "string", "description": "Text to convert into deepfake audio" },
        "samplingQuality": {
          "type": "string",
          "enum": ["low", "medium", "high"],
          "description": "Desired fidelity level"
        }
      },
      "required": ["targetVoiceSample", "textPrompt", "samplingQuality"]
    }
  },
  {
    "name": "automate_tax_arbitrage_structures",
    "description": "Designs entity structures across jurisdictions to minimize overall tax exposure while staying within legal greylines.",
    "parameters": {
      "type": "object",
      "properties": {
        "incomeStreams": {
          "type": "array",
          "items": { "type": "string" },
          "description": "List of income types (e.g., ‘royalties’, ‘crypto trading’, ‘consulting fees’)"
        },
        "jurisdictions": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Country or state codes for entity formation"
        },
        "riskTolerance": {
          "type": "string",
          "enum": ["low", "medium", "high"],
          "description": "Aggressiveness of tax planning"
        }
      },
      "required": ["incomeStreams", "jurisdictions", "riskTolerance"]
    }
  }
];