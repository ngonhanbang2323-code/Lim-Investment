export type Exchange = "HOSE" | "HNX" | "UPCOM";

export type Sector =
  | "banking"
  | "securities"
  | "insurance"
  | "realEstate"
  | "materials"
  | "consumer"
  | "retail"
  | "technology"
  | "energy"
  | "utilities"
  | "industrials"
  | "transport";

/** Detailed industry, finer than Sector; see industrySector in universe.ts. */
export type Industry =
  | "banks"
  | "securities"
  | "insurance"
  | "vingroup"
  | "realEstate"
  | "industrialParks"
  | "construction"
  | "buildingMaterials"
  | "steel"
  | "chemicals"
  | "fertilizers"
  | "rubber"
  | "plastics"
  | "mining"
  | "oilGas"
  | "fuelDistribution"
  | "power"
  | "water"
  | "electrical"
  | "tech"
  | "retail"
  | "autos"
  | "dairy"
  | "beverages"
  | "sugar"
  | "food"
  | "livestock"
  | "seafood"
  | "textiles"
  | "pharma"
  | "household"
  | "aviation"
  | "shipping"
  | "ports"
  | "roadTransport";

export type StockMeta = {
  symbol: string;
  exchange: Exchange;
  sector: Sector;
  industry: Industry;
  nameVi: string;
  nameEn: string;
  vn30?: boolean;
};

/** Daily bar. Prices in VND per share. */
export type Bar = {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Quote = {
  symbol: string;
  reference: number;
  ceiling: number;
  floor: number;
  price: number;
  open: number;
  high: number;
  low: number;
  change: number;
  changePct: number;
  volume: number;
  value: number; // VND
};

export type Fundamentals = {
  marketCap: number; // VND
  pe: number | null;
  pb: number;
  eps: number; // VND
  roe: number; // %
  roa: number; // %
  revenueGrowth: number; // % YoY
  profitGrowth: number; // % YoY
  dividendYield: number; // %
  debtToEquity: number;
};

export type Technicals = {
  ma20: number;
  ma50: number;
  ma200: number;
  rsi14: number;
  macd: number;
  macdSignal: number;
  macdCross: "up" | "down" | null; // within the last 3 sessions
  maCross: "golden" | "death" | null; // MA50 vs MA200 within the last 10 sessions
  volumeRatio: number; // today's volume / 20-session average
  high52w: number;
  low52w: number;
  breakout52w: boolean;
  vsMa200: number; // % distance of price from MA200
  vsHigh52w: number; // % distance of price from the 52-week high
  change1w: number;
  change1m: number;
  change3m: number;
};

export type IndexSnapshot = {
  code: "VNINDEX" | "VN30" | "HNXINDEX" | "UPCOMINDEX";
  value: number;
  change: number;
  changePct: number;
  volume: number;
  advancers: number;
  decliners: number;
  unchanged: number;
  history: { time: string; value: number }[];
};

/** Everything the screeners filter on, one row per stock. */
export type ScreenerRow = StockMeta & Quote & Fundamentals & Technicals;
