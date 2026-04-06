# Market Research: Asia and Africa

## Scope

This note is sized for the product direction shown in the portfolio and repo:

- merchant payment acceptance
- QR and wallet-based collections
- merchant operations dashboard
- embedded working-capital / credit use cases

`Tier 2 competitors` below means strong regional challengers and specialists, not global category leaders such as Stripe, Adyen, Alipay or PayPal.

## Executive Summary

The opportunity is real in both Asia and Africa, but the win pattern is not "be another payment gateway." The strongest opening is to position Wing / Cool PayWay as a merchant operating stack for under-digitized SMEs: QR acceptance, wallet settlement, merchant analytics, and payment-data-driven credit.

Two market signals stand out:

- Asia has a very large SME base, and ADB says MSMEs represented `99.8%` of enterprises across 26 Asia-Pacific economies in 2024, with about `72%` operating in traditional services.
- Africa remains the center of mobile money usage, while Asia is one of the fastest-growing regions for mobile-money-enabled merchant payments.

The most defensible wedge is:

1. local QR + wallet acceptance
2. lightweight merchant onboarding
3. daily cashflow visibility
4. embedded working capital based on transaction behavior

## Market Context

### Asia

- ADB's 2025 Asia SME Monitor says MSMEs accounted for `99.8%` of enterprises, `67.6%` of the workforce, and `38.7%` of output across 26 economies in Asia and the Pacific.
- The same ADB summary says roughly `72%` of MSMEs operate in traditional services such as distributive trade, which is directly relevant for merchant payments and merchant tooling.
- GSMA's 2025 mobile money report says East Asia and the Pacific was one of the fastest-growing regions for active mobile money accounts in 2024.
- GSMA also notes there is still "more room for more digital transactions in the ASEAN region," which supports a merchant digitization opportunity rather than a fully saturated market view.

### Africa

- IFC's regional finance-gap work shows Sub-Saharan Africa has a formal SME finance gap of about `$245B`.
- GSMA's 2025 mobile money report says Sub-Saharan Africa remains the epicenter of mobile money, with more than `1.1B` registered accounts.
- GSMA also reports customers paid merchants more than `$100B` via mobile money in 2024, with Sub-Saharan Africa responsible for roughly two-thirds of merchant-payment value.
- World Bank Findex notes mobile money is foundational in Sub-Saharan Africa, but digital merchant payment usage still has room to grow across many countries, especially outside the strongest mobile-money markets.

## TAM / SAM / SOM

### Recommended sizing logic

For this product, the cleanest board-style sizing is to use two lenses:

- `Demand lens`: SME finance gap, because the product road map includes merchant lending / working capital.
- `Adoption lens`: digital merchant payment growth, because the product starts from payment acceptance and merchant operations.

### TAM

Use the formal SME finance gap as the broad regional problem pool:

- East Asia & Pacific: `$2.11T`
- South Asia: `$291B`
- Sub-Saharan Africa: `$245B`

`Total TAM = about $2.65T`

This is not pure payments revenue. It is a proxy for the wider merchant financial-services opportunity that a payment-led merchant platform can unlock over time.

### SAM

For a realistic first-wave serviceable market, focus on countries where one or more of these are already present:

- interoperable QR or account-based payments
- strong mobile money or wallet behavior
- SME-heavy retail / trade base
- bank, telco, or ecosystem partners that need white-label merchant infrastructure

Suggested SAM geography:

- Southeast Asia: Cambodia, Indonesia, Philippines, Vietnam, Malaysia, Singapore
- Africa: Egypt, Nigeria, Kenya, South Africa

Because public cross-country data is inconsistent at a like-for-like level, a practical deck assumption is to model SAM as `4% to 7%` of TAM for the initial 10-country focus.

- `SAM range = about $106B to $185B`

### SOM

A credible 5-year SOM for a tier-2 regional challenger is `0.05% to 0.10%` of SAM captured through enabled merchant flow and embedded finance.

- `SOM range = about $53M to $185M`

Operationally, that maps to roughly:

- `25,000 to 60,000` active merchants
- concentrated in retail, F&B, convenience, neighborhood services, and informal-to-formal SMEs

### Slide-ready TAM / SAM / SOM message

`TAM:` $2.65T formal SME finance and merchant-liquidity problem across Asia + Sub-Saharan Africa  
`SAM:` $106B-$185B first-wave opportunity in digitizing ASEAN + key African merchant corridors  
`SOM:` $53M-$185M realistic 5-year capture for a regional white-label merchant platform

## Competitor Analysis: Tier 2 Companies Already in Market

## Asia

| Company | Core strength | Why they matter | Gap / weakness Wing can exploit |
| --- | --- | --- | --- |
| Xendit | Regional payment gateway, payouts, platform payments, financing | Strong Southeast Asia multi-market infrastructure with broad payment-method coverage | More online/API-led and expansion-led; weaker local bank-led merchant operating story for frontier markets |
| HitPay | SMB payments for online + in-person, cards, QR, wallets, fast onboarding | Very strong SMB simplicity and checkout coverage for Southeast Asia | Less differentiated on embedded credit and bank-led merchant financial operations |
| FOMO Pay | Cross-border payments, SGQR roots, merchant acquisition, multi-currency flows | Strong for cross-border and regulated QR / payment infrastructure in Singapore and nearby corridors | Better for payment connectivity than day-to-day SME merchant operations and lending |
| DOKU | Indonesia-focused online/offline/cross-border payments | Strong local relevance and broad payment-method support in Indonesia | Country depth is strong, but cross-market SME operating stack story is less complete |

### Asia takeaways

- Asia's tier-2 field is strong on checkout, payouts, and payment-method coverage.
- Fewer players combine `payments + merchant analytics + embedded lending + bank/telco white-label deployment` in a simple SME package.
- That is where Wing can differentiate.

## Africa

| Company | Core strength | Why they matter | Gap / weakness Wing can exploit |
| --- | --- | --- | --- |
| Paymob | Omnichannel payments, online + in-store acceptance, MENA/Africa infrastructure | Strong merchant acceptance layer and broad payment orchestration | More PSP-focused; less distinctive as a lightweight merchant operating system for frontier bank partners |
| Yoco | SME POS, online payments, reporting, cashflow tools | Excellent SME experience and strong fit for small business operations | Mostly merchant-direct and South Africa-centric versus white-label bank ecosystem expansion |
| Moniepoint | Business banking, POS, payments, credit, business management | Probably the closest model match because it combines payments, banking, credit, and ops tools | Deeply Nigeria-led; replicating this regionally is hard, and cross-border white-label bank deployments remain an opening |
| Onafriq (formerly MFS Africa) | Pan-African network interoperability and cross-border reach | Very strong network-of-networks infrastructure across wallets, banks, and partners | More network rail / enterprise infrastructure than frontline SME merchant product experience |

### Africa takeaways

- Africa's tier-2 leaders are stronger than many decks assume.
- The field is split between merchant-facing operators such as Yoco and Moniepoint, and network infrastructure players such as Onafriq.
- Wing should avoid competing head-on as a generic PSP and instead combine local merchant UX with partner-led distribution.

## Strategic White Space for Wing / Cool PayWay

The strongest whitespace is not "best checkout." It is:

- `bank-led merchant operating system`
- `QR + wallet settlement + merchant cashflow dashboard`
- `embedded working capital from transaction history`
- `Telegram / lightweight messaging workflow for low-tech merchants`
- `white-label deployment for banks, MFIs, telcos, and merchant networks`

This fits especially well in markets where:

- merchants still reconcile manually
- payment acceptance is fragmented across wallets, banks, and QR schemes
- lenders need better merchant cashflow signals
- merchants need credit faster than traditional underwriting allows

## Recommended Positioning

Position the offer as:

`A white-label merchant growth stack for banks and ecosystem partners in emerging markets`

Core modules:

1. merchant onboarding and KYC
2. QR / wallet / transfer acceptance
3. transaction monitoring and reconciliation
4. merchant insights and benchmarking
5. pre-qualified working capital

## Best Initial Beachheads

### Asia

- Cambodia
- Indonesia
- Philippines
- Vietnam

Why:

- strong QR / wallet relevance
- large SME trade base
- policy support for digital payments and mobile money

### Africa

- Egypt
- Nigeria
- Kenya
- South Africa

Why:

- strong digital payment momentum
- clear SME merchant pain points
- better availability of payment rails, agents, wallets, or acquiring infrastructure

## What To Put In The Deck

You can turn this into 3 slides very quickly:

### Slide 1: Market Opportunity

- Asia-Pacific MSMEs dominate enterprise counts and are concentrated in trade and services.
- Sub-Saharan Africa remains the global center of mobile money usage.
- Merchant payments via mobile money exceeded $100B in 2024 and continue to grow fast.

### Slide 2: TAM / SAM / SOM

- TAM: `$2.65T`
- SAM: `$106B-$185B`
- SOM: `$53M-$185M`
- Bottom note: `TAM uses formal SME finance gap as proxy for broader merchant financial-services opportunity`

### Slide 3: Competitive Positioning

- Tier-2 competitors are strong in payments rails, checkout, POS, and payouts.
- Wing opportunity is to win at `merchant operations + embedded finance + white-label bank distribution`.
- Best fit is frontier and growth markets where merchants need simple onboarding, QR acceptance, and working capital.

## Assumptions To State Explicitly

- Africa sizing here uses `Sub-Saharan Africa` for most comparable public market figures, because that is where cross-country mobile-money data is strongest.
- TAM is based on `SME finance gap`, so it represents the broader merchant financial-services opportunity, not direct payment-gateway revenue.
- SAM and SOM are scenario-based planning estimates for a strategy deck, not audited market-share forecasts.
- The competitor classification as `tier 2` is an analytical choice, not a claim made by the companies themselves.

## Sources

- Asian Development Bank, Asia Small and Medium-Sized Enterprise Monitor 2025: [ADB 2025 Asia SME Monitor](https://data.adb.org/dataset/2025-asia-small-and-medium-sized-enterprise-monitor)
- Asian Development Bank, Asia Small and Medium-Sized Enterprise Monitor 2024: [ADB 2024 Asia SME Monitor](https://data.adb.org/dataset/2024-asia-small-and-medium-sized-enterprise-monitor)
- IFC / World Bank Group, SME finance-gap references summarized in IFC reporting: [IFC Small Business, Big Growth](https://www.ifc.org/content/dam/ifc/doc/mgrt/ifc-sme-report-2021-fa-digital.pdf)
- GSMA, State of the Industry Report on Mobile Money 2025: [GSMA 2025 Mobile Money Report](https://www.gsma.com/solutions-and-impact/connectivity-for-good/mobile-for-development/wp-content/uploads/2025/04/The-State-of-the-Industry-Report-2025_English.pdf)
- World Bank Global Findex 2021 overview: [World Bank Global Findex](https://www.worldbank.org/en/publication/globalfindex/interactive-executive-summary-visualization)
- Xendit: [Xendit](https://www.xendit.co/en/)
- HitPay: [HitPay](https://hitpayapp.com/)
- FOMO Pay: [FOMO Pay](https://www.fomopay.com/)
- DOKU: [DOKU](https://www.doku.com/en-us/about)
- Paymob: [Paymob](https://paymob.com/en/about-us)
- Yoco: [Yoco](https://www.yoco.com/za/v3/)
- Moniepoint: [Moniepoint](https://www.moniepoint.com/)
- Onafriq / MFS Africa context: [Onafriq](https://onafriq.com/press/article/mfs-africa-joins-the-pan-african-payment) and [FSD Africa portfolio note](https://fsdafrica.org/investment/mfs-africa-now-onafriq/)
