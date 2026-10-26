// Idempotent seed: safe to run on every deploy.
// - Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD if that account doesn't exist.
// - Adds sample articles only while the database has none.
// - Adds a demo client with a managed portfolio only when SEED_DEMO=1 (local development).
import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);

const db = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("seed: ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin");
    return null;
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return existing;
  if (password.length < 10) throw new Error("ADMIN_PASSWORD must be at least 10 characters.");
  const admin = await db.user.create({
    data: { email, name: "Lim Investment", role: "ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`seed: created admin ${email}`);
  return admin;
}

const posts = [
  {
    slug: "doc-bang-dien-chung-khoan",
    category: "education",
    daysAgo: 2,
    tr: {
      vi: {
        title: "Đọc bảng điện chứng khoán trong 5 phút",
        excerpt: "Giá tham chiếu, trần, sàn và năm màu trên bảng điện nói gì với nhà đầu tư? Hướng dẫn ngắn cho người mới bắt đầu.",
        body: `Bảng điện là nơi đầu tiên nhà đầu tư nhìn vào mỗi phiên. Chỉ cần hiểu vài cột chính là bạn đã đọc được phần lớn thông tin.

## Giá tham chiếu, trần và sàn

Giá tham chiếu thường là giá đóng cửa của phiên liền trước. Từ giá này, sàn giao dịch tính ra biên độ dao động trong ngày: ±7% với HOSE, ±10% với HNX và ±15% với UPCoM. Giá trần là mức cao nhất, giá sàn là mức thấp nhất được phép khớp lệnh trong phiên.

## Năm màu quen thuộc

Màu tím là giá trần, xanh lá là tăng so với tham chiếu, vàng là đứng giá, đỏ là giảm và xanh lam là giá sàn. Nhìn màu, bạn biết ngay một mã đang mạnh hay yếu so với hôm qua.

## Khối lượng và giá trị giao dịch

Khối lượng cho biết bao nhiêu cổ phiếu đã được mua bán; giá trị cho biết dòng tiền thực sự đi qua mã đó. Một mã tăng giá với thanh khoản thấp đáng tin cậy kém hơn một mã tăng với thanh khoản cao.

Bảng giá trên website Lim Investment dùng đúng quy ước màu này, để bạn chuyển từ ứng dụng của công ty chứng khoán sang mà không phải làm quen lại.`,
      },
      en: {
        title: "Reading a Vietnamese price board in five minutes",
        excerpt: "What do the reference, ceiling and floor prices and the five board colours tell you? A short guide for new investors.",
        body: `The price board is the first thing investors look at every session. Understanding a few columns gets you most of the way.

## Reference, ceiling and floor

The reference price is usually the previous session's close. From it the exchange sets the daily trading band: ±7% on HOSE, ±10% on HNX and ±15% on UPCoM. The ceiling is the highest and the floor the lowest price that can trade that day.

## Five familiar colours

Purple is the ceiling, green is up from the reference, yellow is unchanged, red is down and cyan is the floor. The colour alone tells you how a stock is doing against yesterday.

## Volume and value traded

Volume is how many shares changed hands; value is how much money actually moved through the stock. A price rise on thin trading is less convincing than one on heavy trading.

The price board on the Lim Investment site uses exactly this colour convention, so moving over from your broker's app needs no relearning.`,
      },
      "zh-TW": {
        title: "五分鐘看懂越南股市行情表",
        excerpt: "參考價、漲停、跌停與行情表上的五種顏色代表什麼？給新手投資人的簡短指南。",
        body: `行情表是投資人每個交易日最先看的地方。只要理解幾個主要欄位，就能掌握大部分資訊。

## 參考價、漲停與跌停

參考價通常是前一交易日的收盤價。交易所據此設定當日漲跌幅：HOSE 為 ±7%，HNX 為 ±10%，UPCoM 為 ±15%。漲停價是當日可成交的最高價，跌停價則是最低價。

## 五種熟悉的顏色

紫色代表漲停，綠色代表高於參考價，黃色代表平盤，紅色代表下跌，青色代表跌停。只看顏色，就能知道個股相較昨日的強弱。

## 成交量與成交值

成交量是成交的股數，成交值則是實際流經該股的資金。低量上漲的可信度，不如放量上漲。

Lim Investment 網站上的行情表採用相同的配色規則，從券商 App 切換過來也不需要重新適應。`,
      },
    },
  },
  {
    slug: "pe-thap-chua-chac-da-re",
    category: "education",
    daysAgo: 6,
    tr: {
      vi: {
        title: "P/E thấp chưa chắc đã rẻ",
        excerpt: "Chỉ số P/E là điểm khởi đầu tốt, nhưng dùng một mình rất dễ dẫn đến bẫy giá trị. Ba câu hỏi nên đặt ra trước khi mua.",
        body: `P/E (giá trên lợi nhuận mỗi cổ phiếu) cho biết nhà đầu tư đang trả bao nhiêu đồng cho mỗi đồng lợi nhuận của doanh nghiệp. Đó là lý do bộ lọc cơ bản của chúng tôi đặt P/E lên đầu.

## Lợi nhuận có bền không?

Một doanh nghiệp vừa có khoản lãi bất thường từ bán tài sản sẽ có P/E rất thấp trong một năm. Năm sau, khi khoản lãi đó không lặp lại, P/E sẽ bật cao trở lại.

## Ngành có chu kỳ không?

Doanh nghiệp thép, hóa chất hay chứng khoán thường có P/E thấp nhất đúng lúc lợi nhuận ở đỉnh chu kỳ. Mua theo P/E thấp ở nhóm này có thể là mua đỉnh.

## So với ai?

Ngân hàng thường giao dịch ở P/E 6–12 lần, trong khi doanh nghiệp công nghệ có thể ở 15–25 lần. So P/E giữa hai ngành khác nhau không có nhiều ý nghĩa; hãy so trong cùng ngành và với chính lịch sử của doanh nghiệp.

Trong bộ lọc FA, bạn có thể kết hợp P/E với ROE và tăng trưởng lợi nhuận để loại bớt các trường hợp rẻ nhưng không tốt.`,
      },
      en: {
        title: "A low P/E isn't always cheap",
        excerpt: "P/E is a good starting point, but used alone it easily leads into value traps. Three questions to ask before buying.",
        body: `The P/E ratio tells you how much investors pay for each dong of a company's earnings. That's why our fundamental screener puts it first.

## Are the earnings durable?

A company that just booked a one-off gain from an asset sale will show a very low P/E for a year. When the gain doesn't repeat, the P/E jumps back up.

## Is the sector cyclical?

Steel, chemicals and brokerages often have their lowest P/E exactly when profits peak. Buying them on a low P/E can mean buying the top.

## Compared with what?

Banks usually trade at 6–12 times earnings, while technology companies may trade at 15–25. Comparing P/E across sectors says little; compare within a sector and against the company's own history.

In the FA screener you can combine P/E with ROE and profit growth to filter out stocks that are cheap for a reason.`,
      },
      "zh-TW": {
        title: "本益比低不一定便宜",
        excerpt: "本益比是很好的起點，但單獨使用很容易落入價值陷阱。買進前應該先問的三個問題。",
        body: `本益比（股價除以每股盈餘）代表投資人為企業每一元獲利支付多少錢，這也是我們的基本面選股器把它放在第一位的原因。

## 獲利能持續嗎？

剛因出售資產認列一次性收益的企業，當年本益比會非常低；隔年收益不再出現時，本益比又會跳回高檔。

## 產業有景氣循環嗎？

鋼鐵、化工或證券業往往在獲利達到高峰時本益比最低。依低本益比買進這類股票，可能正好買在頂點。

## 跟誰比較？

銀行股本益比通常在 6–12 倍，科技股則可能在 15–25 倍。跨產業比較意義不大，應與同業及企業自身的歷史比較。

在基本面選股器中，您可以將本益比與 ROE、獲利成長結合，排除「便宜但有原因」的股票。`,
      },
    },
  },
  {
    slug: "dau-tu-dinh-ky-va-lai-kep",
    category: "education",
    daysAgo: 11,
    tr: {
      vi: {
        title: "Đầu tư định kỳ và sức mạnh của lãi kép",
        excerpt: "Không cần đoán đúng đáy thị trường. Một kế hoạch góp vốn đều đặn và đủ dài thường quan trọng hơn thời điểm mua.",
        body: `Phần lớn nhà đầu tư cá nhân mất tiền không phải vì chọn sai cổ phiếu, mà vì mua nhiều khi thị trường hưng phấn và bán tháo khi thị trường sợ hãi.

## Góp đều, bất kể thị trường

Đầu tư định kỳ nghĩa là bỏ một khoản cố định vào danh mục mỗi tháng. Khi giá cao, khoản tiền đó mua được ít cổ phiếu hơn; khi giá thấp, mua được nhiều hơn. Giá vốn bình quân vì thế tự động được làm mượt.

## Thời gian là biến số lớn nhất

Với lãi kép, phần lớn tăng trưởng đến ở những năm cuối. Đó là lý do biểu tượng của Lim Investment là những vòng gỗ: mỗi vòng là một năm, và cây lớn nhanh nhất khi đã có nhiều vòng.

## Kỷ luật hơn dự báo

Chúng tôi không dự báo thị trường tuần tới. Chúng tôi giúp khách hàng xây kế hoạch góp vốn phù hợp với thu nhập và mục tiêu, rồi đồng hành để kế hoạch đó không bị bỏ dở giữa chừng.`,
      },
      en: {
        title: "Regular investing and the power of compounding",
        excerpt: "You don't need to call the bottom. A steady, long enough contribution plan usually matters more than timing.",
        body: `Most individual investors lose money not by picking the wrong stocks but by buying heavily when markets are euphoric and selling when they are afraid.

## Contribute steadily, whatever the market

Regular investing means putting a fixed amount into your portfolio every month. When prices are high, that amount buys fewer shares; when they are low, it buys more. Your average cost is smoothed automatically.

## Time is the biggest variable

With compounding, most of the growth arrives in the later years. That's why Lim Investment's symbol is a set of growth rings: each ring is a year, and a tree grows fastest once it already has many.

## Discipline over forecasts

We don't forecast next week's market. We help clients build a contribution plan that fits their income and goals, and stay with them so the plan isn't abandoned halfway.`,
      },
      "zh-TW": {
        title: "定期投資與複利的力量",
        excerpt: "不需要猜中市場底部。穩定且足夠長期的投入計畫，通常比進場時機更重要。",
        body: `多數個人投資人虧損，並不是因為選錯股票，而是在市場狂熱時大量買進、在恐慌時拋售。

## 不論行情，穩定投入

定期投資是每月將固定金額投入投資組合。股價高時買到較少股數，股價低時買到較多股數，平均成本因此自然平滑。

## 時間是最大的變數

在複利作用下，大部分成長出現在後期。這正是 Lim Investment 以年輪為標誌的原因：每一圈代表一年，樹在年輪越多時長得越快。

## 紀律勝於預測

我們不預測下週的行情。我們協助客戶依收入與目標建立投入計畫，並持續陪伴，避免計畫半途而廢。`,
      },
    },
  },
  {
    slug: "cach-chung-toi-danh-gia-ngan-hang",
    category: "company",
    daysAgo: 17,
    tr: {
      vi: {
        title: "Cách chúng tôi đánh giá một cổ phiếu ngân hàng",
        excerpt: "Ngân hàng chiếm tỷ trọng lớn nhất trên sàn HOSE. Đây là bốn chỉ số chúng tôi xem trước tiên.",
        body: `Nhóm ngân hàng chiếm phần lớn vốn hóa của VN-Index, nên hầu như danh mục nào cũng có ít nhất một mã ngân hàng. Chúng tôi đánh giá nhóm này theo một khung cố định.

## ROE và chất lượng lợi nhuận

ROE cao là tốt, nhưng chúng tôi tách phần lợi nhuận đến từ hoạt động cho vay cốt lõi với phần đến từ thu nhập bất thường hoặc hoàn nhập dự phòng.

## Chất lượng tài sản

Tỷ lệ nợ xấu và tỷ lệ bao phủ nợ xấu cho biết ngân hàng đã chuẩn bị bao nhiêu cho rủi ro. Một ngân hàng có lợi nhuận đẹp nhưng bao phủ nợ xấu thấp có thể đang mượn lợi nhuận tương lai.

## Chi phí vốn và tiền gửi không kỳ hạn

Tỷ lệ tiền gửi không kỳ hạn (CASA) cao giúp ngân hàng có nguồn vốn rẻ, một lợi thế bền vững qua chu kỳ lãi suất.

## Định giá theo P/B

Với ngân hàng, P/B thường có ý nghĩa hơn P/E. Chúng tôi so P/B với ROE bền vững của từng ngân hàng để biết thị trường đang trả giá hợp lý hay không.`,
      },
      en: {
        title: "How we evaluate a bank stock",
        excerpt: "Banks are the largest group on HOSE. These are the four things we look at first.",
        body: `Banks make up the largest share of VN-Index market capitalisation, so almost every portfolio holds at least one. We evaluate them with a fixed framework.

## ROE and earnings quality

High ROE is good, but we separate profit from core lending from profit that comes from one-off income or provision write-backs.

## Asset quality

The non-performing loan ratio and loan-loss coverage show how much a bank has set aside for risk. A bank with strong profits but thin coverage may be borrowing from future earnings.

## Funding cost and current accounts

A high share of current and savings accounts (CASA) gives a bank cheap funding, a durable advantage across rate cycles.

## Valuing on P/B

For banks, P/B is usually more meaningful than P/E. We compare P/B with each bank's sustainable ROE to judge whether the market price is reasonable.`,
      },
      "zh-TW": {
        title: "我們如何評估銀行股",
        excerpt: "銀行股是 HOSE 市值最大的族群。以下是我們最先檢視的四項指標。",
        body: `銀行股占 VN-Index 市值的最大比重，幾乎每個投資組合都至少持有一檔。我們以固定的架構評估這個族群。

## ROE 與獲利品質

ROE 高是好事，但我們會區分核心放款業務的獲利，以及來自一次性收入或呆帳準備迴轉的獲利。

## 資產品質

逾放比與備抵呆帳覆蓋率顯示銀行為風險預留了多少。獲利亮眼但覆蓋率偏低的銀行，可能是在預支未來的獲利。

## 資金成本與活期存款

活期存款比率（CASA）高，代表銀行擁有低成本資金，這是跨越利率循環的持久優勢。

## 以股價淨值比估值

對銀行而言，股價淨值比通常比本益比更有意義。我們將股價淨值比與各銀行可持續的 ROE 比較，判斷市場價格是否合理。`,
      },
    },
  },
];

async function seedPosts(authorId) {
  if ((await db.post.count()) > 0) return;
  for (const p of posts) {
    await db.post.create({
      data: {
        slug: p.slug,
        category: p.category,
        published: true,
        publishedAt: new Date(Date.now() - p.daysAgo * 86400_000),
        authorId,
        translations: { create: Object.entries(p.tr).map(([locale, t]) => ({ locale, ...t })) },
      },
    });
  }
  console.log(`seed: created ${posts.length} sample articles`);
}

async function seedDemoClient() {
  const email = "demo@lim.local";
  if (await db.user.findUnique({ where: { email } })) return;
  const user = await db.user.create({
    data: { email, name: "Nguyễn Văn Demo", passwordHash: await bcrypt.hash("LimDemo@2026", 12) },
  });
  const start = new Date(Date.now() - 400 * 86400_000);
  const account = await db.managedAccount.create({
    data: {
      userId: user.id,
      name: "Danh mục Tăng trưởng Bền vững",
      strategy: "Cổ phiếu chất lượng, nắm giữ dài hạn",
      inceptionDate: start,
      cash: 182_500_000,
      holdings: {
        create: [
          { symbol: "FPT", quantity: 3000, avgCost: 92_000 },
          { symbol: "VCB", quantity: 6000, avgCost: 56_500 },
          { symbol: "MWG", quantity: 4000, avgCost: 52_300 },
          { symbol: "REE", quantity: 3500, avgCost: 61_000 },
          { symbol: "PNJ", quantity: 2000, avgCost: 74_800 },
          { symbol: "ACB", quantity: 8000, avgCost: 22_900 },
        ],
      },
      reports: {
        create: [
          { title: "Báo cáo danh mục tháng 9/2026", url: "https://example.com/bao-cao-thang-9.pdf", date: new Date("2026-10-05") },
          { title: "Báo cáo danh mục tháng 8/2026", url: "https://example.com/bao-cao-thang-8.pdf", date: new Date("2026-09-05") },
        ],
      },
    },
  });
  // Monthly NAV points with a gentle upward drift.
  let nav = 1_500_000_000;
  for (let m = 0; m <= 13; m++) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + m);
    if (date > new Date()) break;
    await db.navPoint.create({ data: { accountId: account.id, date, nav: Math.round(nav) } });
    nav *= 1 + 0.012 + 0.03 * Math.sin(m * 1.7);
  }
  await db.watchlistItem.createMany({ data: ["HPG", "SSI", "GMD", "DGC"].map((symbol) => ({ userId: user.id, symbol })) });
  await db.personalHolding.createMany({
    data: [
      { userId: user.id, symbol: "HPG", quantity: 2000, avgPrice: 24_500 },
      { userId: user.id, symbol: "SSI", quantity: 1500, avgPrice: 30_200 },
    ],
  });
  console.log("seed: created demo client demo@lim.local");
}

try {
  const admin = await seedAdmin();
  await seedPosts(admin?.id ?? null);
  if (process.env.SEED_DEMO === "1") await seedDemoClient();
} finally {
  await db.$disconnect();
}
