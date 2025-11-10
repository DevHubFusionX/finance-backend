const logger = require('../utils/logger');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

class AIService {
  constructor() {
    this.apiKey = GROQ_API_KEY;
  }

  async generateSpendingInsights(transactions, userProfile) {
    try {
      const currencySymbols = { USD: '$', EUR: '€', GBP: '£', CAD: '$', AUD: '$', JPY: '¥', INR: '₹', NGN: '₦', CNY: '¥', CHF: 'Fr', BRL: 'R$', MXN: '$', ZAR: 'R', KRW: '₩' };
      const symbol = currencySymbols[userProfile.currency] || '$';
      
      const prompt = `Analyze these financial transactions and provide insights:

User Profile: ${userProfile.currency} currency (${symbol}), ${userProfile.country} location

Recent Transactions:
${transactions.map(t => `${t.date}: ${t.type} ${symbol}${t.amount} - ${t.category} (${t.description})`).join('\n')}

Provide 3-4 key insights about spending patterns, potential savings, and recommendations. Use ${symbol} for all amounts. Keep it concise and actionable.`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (!data.choices || !data.choices[0]) {
        logger.error('Invalid Groq API response:', data);
        return 'Unable to generate insights at this time.';
      }
      return data.choices[0].message.content;
    } catch (error) {
      logger.error('AI insights generation failed:', error);
      return 'Unable to generate insights at this time.';
    }
  }

  async predictSpending(transactions, timeframe = '30d') {
    try {
      const prompt = `Based on these transactions, predict spending for the next ${timeframe}:

${transactions.map(t => `${t.date}: $${t.amount} - ${t.category}`).join('\n')}

Provide a JSON response with predicted amounts by category and total.`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.3
        })
      });

      const data = await response.json();
      if (!data.choices || !data.choices[0]) {
        return { total: 0, categories: {} };
      }
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      logger.error('AI prediction failed:', error);
      return { total: 0, categories: {} };
    }
  }

  async generateBudgetRecommendations(income, expenses, goals) {
    try {
      const prompt = `Create budget recommendations:
Income: $${income}
Current Expenses: $${expenses}
Goals: ${goals.map(g => `${g.name}: $${g.target}`).join(', ')}

Suggest optimal budget allocation with percentages.`;

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 250,
          temperature: 0.5
        })
      });

      const data = await response.json();
      if (!data.choices || !data.choices[0]) {
        return 'Unable to generate budget recommendations.';
      }
      return data.choices[0].message.content;
    } catch (error) {
      logger.error('AI budget recommendations failed:', error);
      return 'Unable to generate budget recommendations.';
    }
  }
}

module.exports = new AIService();