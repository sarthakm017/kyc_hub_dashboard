# KYC Hub Dashboard

A full-stack KYC (Know Your Customer) dashboard built with Node.js/Express + MongoDB backend and a React + AntD frontend. Integrates Recharts for data visualizations and includes dynamic risk scoring and advanced table filtering.

---

## 🚀 Setup Instructions

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-username/kyc-hub-dashboard.git
   cd kyc-hub-dashboard

   ```

2. **Backend**  
   cd backend
   npm install
   cp .env.example .env
   npm run dev

3. **FrontEnd**

   cd ../frontend
   npm install
   cp .env.example .env

# Edit .env to set your API URL:

# REACT_APP_API_URL="http://localhost:5001/api"

npm start

4. **Seeding sample data**  
   cd backend
   node scripts/seedFinancials.js

5. **Risk Scoring Explanation**

Each customer receives a Risk Score from 0 (lowest risk) to 100 (highest risk) based on:

1. Credit Score (300–850)

Normalized:
creditRisk = ((850 - creditScore) / (850 - 300)) \* 100

2. Loan Repayment History (array of 1 = paid, 0 = missed)
   repaymentRisk = (missedPayments / totalPayments) \* 100

3. Outstanding Loans vs. Annual Income

   annualIncome = monthlyIncome _ 12
   loanRisk = Math.min((outstandingLoans / annualIncome) _ 100, 100)

The final score is a weighted sum:

    riskScore = Math.round(
    creditRisk _ 0.4 +
    repaymentRisk _ 0.3 +
    loanRisk * 0.3
    );

Low (< 40) — green

Medium (40–69) — gold

High (≥ 70) — red

6. **AI Tool Usage Breakdown**

| Task                                | Tool              | How AI Helped                                   |
| ----------------------------------- | ----------------- | ----------------------------------------------- |
| Code completion & boilerplate       | ChatGPT           | Generated component/controller skeletons        |
| Inline column search implementation | ChatGPT + Codeium | Refined AntD `filterDropdown` patterns          |
| README & documentation drafting     | ChatGPT           | Structured README sections and risk explanation |
| Test scaffolding                    | ChatGPT           | Wrote Jest + RTL test templates                 |
| Styling & layout tweaks             | Codeium           | Suggested theme token adjustments               |
