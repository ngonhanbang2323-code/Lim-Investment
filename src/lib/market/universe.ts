import type { Exchange, Industry, Sector, StockMeta } from "./types";

// Detailed industries (used by the sector strength map) and the broad sector each belongs to.
export const industrySector: Record<Industry, Sector> = {
  banks: "banking",
  securities: "securities",
  insurance: "insurance",
  vingroup: "realEstate",
  realEstate: "realEstate",
  industrialParks: "realEstate",
  construction: "industrials",
  buildingMaterials: "materials",
  steel: "materials",
  chemicals: "materials",
  fertilizers: "materials",
  rubber: "materials",
  plastics: "materials",
  mining: "materials",
  oilGas: "energy",
  fuelDistribution: "energy",
  power: "utilities",
  water: "utilities",
  electrical: "industrials",
  tech: "technology",
  retail: "retail",
  autos: "retail",
  dairy: "consumer",
  beverages: "consumer",
  sugar: "consumer",
  food: "consumer",
  livestock: "consumer",
  seafood: "consumer",
  textiles: "consumer",
  pharma: "consumer",
  household: "consumer",
  aviation: "transport",
  shipping: "transport",
  ports: "transport",
  roadTransport: "transport",
};

export const industries = Object.keys(industrySector) as Industry[];

type Entry = StockMeta & { basePrice: number };

function stock(symbol: string, exchange: Exchange, industry: Industry, nameVi: string, nameEn: string, basePrice: number, vn30 = false): Entry {
  return { symbol, exchange, industry, sector: industrySector[industry], nameVi, nameEn, basePrice, ...(vn30 ? { vn30 } : {}) };
}

// Listed companies covered by the site. Base prices (VND) only seed the sample data provider.
export const universe: Entry[] = [
  // banks
  stock("ACB", "HOSE", "banks", "Ngân hàng TMCP Á Châu", "Asia Commercial Bank", 24700, true),
  stock("BID", "HOSE", "banks", "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", "BIDV", 38900, true),
  stock("CTG", "HOSE", "banks", "Ngân hàng TMCP Công Thương Việt Nam", "VietinBank", 41200, true),
  stock("HDB", "HOSE", "banks", "Ngân hàng TMCP Phát triển TP.HCM", "HDBank", 27100, true),
  stock("LPB", "HOSE", "banks", "Ngân hàng TMCP Lộc Phát Việt Nam", "LPBank", 44500, true),
  stock("MBB", "HOSE", "banks", "Ngân hàng TMCP Quân đội", "Military Commercial Joint Stock Bank", 26800, true),
  stock("SHB", "HOSE", "banks", "Ngân hàng TMCP Sài Gòn – Hà Nội", "SHB", 15800, true),
  stock("STB", "HOSE", "banks", "Ngân hàng TMCP Sài Gòn Thương Tín", "Sacombank", 47600, true),
  stock("TCB", "HOSE", "banks", "Ngân hàng TMCP Kỹ Thương Việt Nam", "Techcombank", 36400, true),
  stock("TPB", "HOSE", "banks", "Ngân hàng TMCP Tiên Phong", "TPBank", 16900, true),
  stock("VCB", "HOSE", "banks", "Ngân hàng TMCP Ngoại thương Việt Nam", "Vietcombank", 61500, true),
  stock("VIB", "HOSE", "banks", "Ngân hàng TMCP Quốc tế Việt Nam", "VIB", 20300, true),
  stock("VPB", "HOSE", "banks", "Ngân hàng TMCP Việt Nam Thịnh Vượng", "VPBank", 29300, true),
  // securities
  stock("HCM", "HOSE", "securities", "Công ty CP Chứng khoán TP.HCM", "HSC Securities", 27900),
  stock("MBS", "HNX", "securities", "Công ty CP Chứng khoán MB", "MB Securities", 31800),
  stock("SHS", "HNX", "securities", "Công ty CP Chứng khoán Sài Gòn – Hà Nội", "SHS Securities", 17200),
  stock("SSI", "HOSE", "securities", "Công ty CP Chứng khoán SSI", "SSI Securities", 33200, true),
  stock("VCI", "HOSE", "securities", "Công ty CP Chứng khoán Vietcap", "Vietcap Securities", 38600),
  stock("VND", "HOSE", "securities", "Công ty CP Chứng khoán VNDIRECT", "VNDIRECT Securities", 18400),
  // insurance
  stock("BMI", "HOSE", "insurance", "Tổng Công ty CP Bảo Minh", "Bao Minh Insurance", 21500),
  stock("BVH", "HOSE", "insurance", "Tập đoàn Bảo Việt", "Bao Viet Holdings", 52400, true),
  stock("MIG", "HOSE", "insurance", "Tổng Công ty CP Bảo hiểm Quân đội", "Military Insurance", 16800),
  stock("PVI", "HNX", "insurance", "Công ty CP PVI", "PVI Holdings", 52000),
  // vingroup
  stock("VHM", "HOSE", "vingroup", "Công ty CP Vinhomes", "Vinhomes", 76200, true),
  stock("VIC", "HOSE", "vingroup", "Tập đoàn Vingroup", "Vingroup", 98500, true),
  stock("VRE", "HOSE", "vingroup", "Công ty CP Vincom Retail", "Vincom Retail", 27300, true),
  // realEstate
  stock("CEO", "HNX", "realEstate", "Công ty CP Tập đoàn C.E.O", "C.E.O Group", 14700),
  stock("DIG", "HOSE", "realEstate", "Tổng Công ty CP Đầu tư Phát triển Xây dựng", "DIC Corp", 18900),
  stock("DXG", "HOSE", "realEstate", "Công ty CP Tập đoàn Đất Xanh", "Dat Xanh Group", 17600),
  stock("KDH", "HOSE", "realEstate", "Công ty CP Đầu tư và Kinh doanh Nhà Khang Điền", "Khang Dien House", 33100),
  stock("NLG", "HOSE", "realEstate", "Công ty CP Đầu tư Nam Long", "Nam Long Investment", 39800),
  stock("NVL", "HOSE", "realEstate", "Công ty CP Tập đoàn Đầu tư Địa ốc No Va", "Novaland", 12300),
  stock("PDR", "HOSE", "realEstate", "Công ty CP Phát triển Bất động sản Phát Đạt", "Phat Dat Real Estate", 19400),
  // industrialParks
  stock("BCM", "HOSE", "industrialParks", "Tổng Công ty Đầu tư và Phát triển Công nghiệp", "Becamex IDC", 66700, true),
  stock("IDC", "HNX", "industrialParks", "Tổng Công ty IDICO", "IDICO Corporation", 41500),
  stock("KBC", "HOSE", "industrialParks", "Tổng Công ty Phát triển Đô thị Kinh Bắc", "Kinh Bac City Development", 30200),
  stock("SZC", "HOSE", "industrialParks", "Công ty CP Sonadezi Châu Đức", "Sonadezi Chau Duc", 35200),
  // construction
  stock("CII", "HOSE", "construction", "Công ty CP Đầu tư Hạ tầng Kỹ thuật TP.HCM", "HCMC Infrastructure Investment", 14200),
  stock("CTD", "HOSE", "construction", "Công ty CP Xây dựng Coteccons", "Coteccons Construction", 78600),
  stock("FCN", "HOSE", "construction", "Công ty CP Fecon", "Fecon", 13400),
  stock("HHV", "HOSE", "construction", "Công ty CP Đầu tư Hạ tầng Giao thông Đèo Cả", "Deo Ca Transport Infrastructure", 12600),
  stock("VCG", "HOSE", "construction", "Tổng Công ty CP Xuất nhập khẩu và Xây dựng Việt Nam", "Vinaconex", 22600),
  // buildingMaterials
  stock("BCC", "HNX", "buildingMaterials", "Công ty CP Xi măng Bỉm Sơn", "Vicem Bim Son Cement", 7800),
  stock("HT1", "HOSE", "buildingMaterials", "Công ty CP Xi măng Vicem Hà Tiên", "Vicem Ha Tien Cement", 12400),
  stock("PTB", "HOSE", "buildingMaterials", "Công ty CP Phú Tài", "Phu Tai JSC", 56300),
  stock("VGC", "HOSE", "buildingMaterials", "Tổng Công ty Viglacera", "Viglacera", 45600),
  // steel
  stock("HPG", "HOSE", "steel", "Công ty CP Tập đoàn Hòa Phát", "Hoa Phat Group", 26900, true),
  stock("HSG", "HOSE", "steel", "Công ty CP Tập đoàn Hoa Sen", "Hoa Sen Group", 18300),
  stock("NKG", "HOSE", "steel", "Công ty CP Thép Nam Kim", "Nam Kim Steel", 15200),
  stock("TLH", "HOSE", "steel", "Công ty CP Tập đoàn Thép Tiến Lên", "Tien Len Steel", 5600),
  // chemicals
  stock("CSV", "HOSE", "chemicals", "Công ty CP Hóa chất Cơ bản miền Nam", "South Basic Chemicals", 32500),
  stock("DGC", "HOSE", "chemicals", "Công ty CP Tập đoàn Hóa chất Đức Giang", "Duc Giang Chemicals", 104600),
  // fertilizers
  stock("BFC", "HOSE", "fertilizers", "Công ty CP Phân bón Bình Điền", "Binh Dien Fertilizer", 42100),
  stock("DCM", "HOSE", "fertilizers", "Công ty CP Phân bón Dầu khí Cà Mau", "PetroVietnam Ca Mau Fertilizer", 34900),
  stock("DPM", "HOSE", "fertilizers", "Tổng Công ty Phân bón và Hóa chất Dầu khí", "PetroVietnam Fertilizer & Chemicals", 36800),
  stock("LAS", "HNX", "fertilizers", "Công ty CP Supe Phốt phát và Hóa chất Lâm Thao", "Lam Thao Fertilizers & Chemicals", 20800),
  // rubber
  stock("DPR", "HOSE", "rubber", "Công ty CP Cao su Đồng Phú", "Dong Phu Rubber", 41800),
  stock("GVR", "HOSE", "rubber", "Tập đoàn Công nghiệp Cao su Việt Nam", "Vietnam Rubber Group", 31400, true),
  stock("PHR", "HOSE", "rubber", "Công ty CP Cao su Phước Hòa", "Phuoc Hoa Rubber", 56200),
  // plastics
  stock("AAA", "HOSE", "plastics", "Công ty CP Nhựa An Phát Xanh", "An Phat Bioplastics", 8100),
  stock("BMP", "HOSE", "plastics", "Công ty CP Nhựa Bình Minh", "Binh Minh Plastics", 128500),
  stock("NTP", "HNX", "plastics", "Công ty CP Nhựa Thiếu niên Tiền Phong", "Tien Phong Plastic", 62300),
  // mining
  stock("DHA", "HOSE", "mining", "Công ty CP Hóa An", "Hoa An JSC", 42000),
  stock("KSB", "HOSE", "mining", "Công ty CP Khoáng sản và Xây dựng Bình Dương", "Binh Duong Mineral & Construction", 18500),
  stock("MSR", "UPCOM", "mining", "Công ty CP Masan High-Tech Materials", "Masan High-Tech Materials", 15800),
  // oilGas
  stock("BSR", "HOSE", "oilGas", "Công ty CP Lọc hóa dầu Bình Sơn", "Binh Son Refining", 21400),
  stock("PVD", "HOSE", "oilGas", "Tổng Công ty CP Khoan và Dịch vụ khoan Dầu khí", "PV Drilling", 23500),
  stock("PVS", "HNX", "oilGas", "Tổng Công ty CP Dịch vụ Kỹ thuật Dầu khí", "PetroVietnam Technical Services", 32700),
  // fuelDistribution
  stock("GAS", "HOSE", "fuelDistribution", "Tổng Công ty Khí Việt Nam", "PV Gas", 66900, true),
  stock("OIL", "UPCOM", "fuelDistribution", "Tổng Công ty Dầu Việt Nam", "PV Oil", 11200),
  stock("PLX", "HOSE", "fuelDistribution", "Tập đoàn Xăng dầu Việt Nam", "Petrolimex", 36200, true),
  // power
  stock("GEG", "HOSE", "power", "Công ty CP Điện Gia Lai", "Gia Lai Electricity", 13600),
  stock("NT2", "HOSE", "power", "Công ty CP Điện lực Dầu khí Nhơn Trạch 2", "PV Power Nhon Trach 2", 18200),
  stock("PC1", "HOSE", "power", "Công ty CP Tập đoàn PC1", "PC1 Group", 23400),
  stock("POW", "HOSE", "power", "Tổng Công ty Điện lực Dầu khí Việt Nam", "PV Power", 12800, true),
  stock("REE", "HOSE", "power", "Công ty CP Cơ điện lạnh", "REE Corporation", 69400),
  // water
  stock("BWE", "HOSE", "water", "Công ty CP Nước – Môi trường Bình Dương", "Biwase", 46700),
  stock("TDM", "HOSE", "water", "Công ty CP Nước Thủ Dầu Một", "Thu Dau Mot Water", 39500),
  // electrical
  stock("CAV", "HOSE", "electrical", "Công ty CP Dây Cáp điện Việt Nam", "Cadivi", 62000),
  stock("GEX", "HOSE", "electrical", "Công ty CP Tập đoàn GELEX", "GELEX Group", 34800),
  // tech
  stock("CMG", "HOSE", "tech", "Công ty CP Tập đoàn Công nghệ CMC", "CMC Corporation", 42600),
  stock("CTR", "HOSE", "tech", "Tổng Công ty CP Công trình Viettel", "Viettel Construction", 108500),
  stock("ELC", "HOSE", "tech", "Công ty CP Công nghệ – Viễn thông Elcom", "Elcom", 21300),
  stock("FPT", "HOSE", "tech", "Công ty CP FPT", "FPT Corporation", 118900, true),
  stock("VGI", "UPCOM", "tech", "Tổng Công ty CP Đầu tư Quốc tế Viettel", "Viettel Global", 86300),
  // retail
  stock("DGW", "HOSE", "retail", "Công ty CP Thế Giới Số", "Digiworld", 41200),
  stock("FRT", "HOSE", "retail", "Công ty CP Bán lẻ Kỹ thuật số FPT", "FPT Digital Retail", 168500),
  stock("MWG", "HOSE", "retail", "Công ty CP Đầu tư Thế Giới Di Động", "Mobile World Investment", 63400, true),
  stock("PNJ", "HOSE", "retail", "Công ty CP Vàng bạc Đá quý Phú Nhuận", "Phu Nhuan Jewelry", 82100),
  // autos
  stock("CTF", "HOSE", "autos", "Công ty CP City Auto", "City Auto", 22400),
  stock("HAX", "HOSE", "autos", "Công ty CP Dịch vụ Ô tô Hàng Xanh", "Haxaco", 15600),
  stock("SVC", "HOSE", "autos", "Công ty CP Dịch vụ Tổng hợp Sài Gòn", "Savico", 25800),
  stock("TMT", "HOSE", "autos", "Công ty CP Ô tô TMT", "TMT Motors", 9200),
  // dairy
  stock("MCM", "HOSE", "dairy", "Công ty CP Giống bò sữa Mộc Châu", "Moc Chau Milk", 31500),
  stock("VNM", "HOSE", "dairy", "Công ty CP Sữa Việt Nam", "Vinamilk", 61800, true),
  // beverages
  stock("BHN", "HOSE", "beverages", "Tổng Công ty CP Bia – Rượu – NGK Hà Nội", "Habeco", 38600),
  stock("SAB", "HOSE", "beverages", "Tổng Công ty CP Bia – Rượu – NGK Sài Gòn", "Sabeco", 47900, true),
  // sugar
  stock("LSS", "HOSE", "sugar", "Công ty CP Mía đường Lam Sơn", "Lam Son Sugar", 11200),
  stock("QNS", "UPCOM", "sugar", "Công ty CP Đường Quảng Ngãi", "Quang Ngai Sugar", 47200),
  stock("SBT", "HOSE", "sugar", "Công ty CP Thành Thành Công – Biên Hòa", "TTC AgriS", 13400),
  // food
  stock("KDC", "HOSE", "food", "Công ty CP Tập đoàn KIDO", "KIDO Group", 52800),
  stock("MSN", "HOSE", "food", "Công ty CP Tập đoàn Masan", "Masan Group", 74300, true),
  stock("PAN", "HOSE", "food", "Công ty CP Tập đoàn PAN", "PAN Group", 27400),
  // livestock
  stock("DBC", "HNX", "livestock", "Công ty CP Tập đoàn Dabaco Việt Nam", "Dabaco Group", 28600),
  stock("HAG", "HOSE", "livestock", "Công ty CP Hoàng Anh Gia Lai", "Hoang Anh Gia Lai", 13900),
  // seafood
  stock("ANV", "HOSE", "seafood", "Công ty CP Nam Việt", "Nam Viet Corp", 18600),
  stock("FMC", "HOSE", "seafood", "Công ty CP Thực phẩm Sao Ta", "Sao Ta Foods", 44800),
  stock("IDI", "HOSE", "seafood", "Công ty CP Đầu tư và Phát triển Đa Quốc Gia I.D.I", "I.D.I Corp", 8200),
  stock("VHC", "HOSE", "seafood", "Công ty CP Vĩnh Hoàn", "Vinh Hoan", 61200),
  // textiles
  stock("MSH", "HOSE", "textiles", "Công ty CP May Sông Hồng", "Song Hong Garment", 42700),
  stock("TCM", "HOSE", "textiles", "Công ty CP Dệt may – Đầu tư – Thương mại Thành Công", "Thanh Cong Textile", 36400),
  stock("TNG", "HNX", "textiles", "Công ty CP Đầu tư và Thương mại TNG", "TNG Investment & Trading", 20100),
  stock("VGT", "UPCOM", "textiles", "Tập đoàn Dệt May Việt Nam", "Vinatex", 12800),
  // pharma
  stock("DBD", "HOSE", "pharma", "Công ty CP Dược – Trang thiết bị Y tế Bình Định", "Bidiphar", 52300),
  stock("DHG", "HOSE", "pharma", "Công ty CP Dược Hậu Giang", "DHG Pharma", 98500),
  stock("DMC", "HOSE", "pharma", "Công ty CP Xuất nhập khẩu Y tế Domesco", "Domesco", 58700),
  stock("IMP", "HOSE", "pharma", "Công ty CP Dược phẩm Imexpharm", "Imexpharm", 48600),
  // household
  stock("RAL", "HOSE", "household", "Công ty CP Bóng đèn Phích nước Rạng Đông", "Rang Dong Light Source", 145000),
  stock("TLG", "HOSE", "household", "Công ty CP Tập đoàn Thiên Long", "Thien Long Group", 51200),
  // aviation
  stock("ACV", "UPCOM", "aviation", "Tổng Công ty Cảng hàng không Việt Nam", "Airports Corporation of Vietnam", 98200),
  stock("HVN", "HOSE", "aviation", "Tổng Công ty Hàng không Việt Nam", "Vietnam Airlines", 28400),
  stock("SCS", "HOSE", "aviation", "Công ty CP Dịch vụ Hàng hóa Sài Gòn", "Saigon Cargo Service", 72400),
  stock("VJC", "HOSE", "aviation", "Công ty CP Hàng không VietJet", "Vietjet Air", 102500, true),
  // shipping
  stock("HAH", "HOSE", "shipping", "Công ty CP Vận tải và Xếp dỡ Hải An", "Hai An Transport & Stevedoring", 58200),
  stock("PVT", "HOSE", "shipping", "Tổng Công ty CP Vận tải Dầu khí", "PV Trans", 19800),
  stock("VOS", "HOSE", "shipping", "Công ty CP Vận tải biển Việt Nam", "Vosco", 13100),
  // ports
  stock("GMD", "HOSE", "ports", "Công ty CP Gemadept", "Gemadept", 61200),
  stock("PHP", "HNX", "ports", "Công ty CP Cảng Hải Phòng", "Port of Hai Phong", 33000),
  stock("SGP", "UPCOM", "ports", "Công ty CP Cảng Sài Gòn", "Saigon Port", 30500),
  stock("VSC", "HOSE", "ports", "Công ty CP Container Việt Nam", "Viconship", 19500),
  // roadTransport
  stock("VNS", "HOSE", "roadTransport", "Công ty CP Ánh Dương Việt Nam", "Vinasun", 11800),
  stock("VTP", "HOSE", "roadTransport", "Tổng Công ty CP Bưu chính Viettel", "Viettel Post", 121300),
];

export const sectors = [
  "banking",
  "securities",
  "insurance",
  "realEstate",
  "materials",
  "consumer",
  "retail",
  "technology",
  "energy",
  "utilities",
  "industrials",
  "transport",
] as const;
