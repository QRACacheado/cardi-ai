// Sistema de conversão de preços baseado em Reais (BRL)
// Taxas de câmbio aproximadas (atualizar periodicamente)

export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CNY';
export type Continent = 'americas' | 'europe' | 'asia' | 'oceania' | 'africa';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  rate: number; // Taxa de conversão de BRL para a moeda
  locale: string;
}

// Taxas de conversão de BRL (Real Brasileiro) para outras moedas
const CURRENCY_RATES: Record<Currency, CurrencyInfo> = {
  BRL: { code: 'BRL', symbol: 'R$', rate: 1, locale: 'pt-BR' },
  USD: { code: 'USD', symbol: '$', rate: 0.20, locale: 'en-US' }, // 1 BRL ≈ 0.20 USD
  EUR: { code: 'EUR', symbol: '€', rate: 0.18, locale: 'de-DE' }, // 1 BRL ≈ 0.18 EUR
  GBP: { code: 'GBP', symbol: '£', rate: 0.16, locale: 'en-GB' }, // 1 BRL ≈ 0.16 GBP
  CAD: { code: 'CAD', symbol: 'C$', rate: 0.27, locale: 'en-CA' }, // 1 BRL ≈ 0.27 CAD
  AUD: { code: 'AUD', symbol: 'A$', rate: 0.30, locale: 'en-AU' }, // 1 BRL ≈ 0.30 AUD
  JPY: { code: 'JPY', symbol: '¥', rate: 30, locale: 'ja-JP' }, // 1 BRL ≈ 30 JPY
  CNY: { code: 'CNY', symbol: '¥', rate: 1.40, locale: 'zh-CN' }, // 1 BRL ≈ 1.40 CNY
};

// Mapeamento de continentes para moedas
const CONTINENT_CURRENCY: Record<Continent, Currency> = {
  americas: 'USD',
  europe: 'EUR',
  asia: 'JPY',
  oceania: 'AUD',
  africa: 'USD', // Usa USD como padrão para África
};

// Detectar continente baseado no timezone do usuário
export function detectContinent(): Continent {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Continente Americano
    if (timezone.includes('America/') || timezone.includes('Canada/')) {
      return 'americas';
    }
    
    // Europa
    if (
      timezone.includes('Europe/') ||
      timezone.includes('GMT') ||
      timezone.includes('UTC')
    ) {
      return 'europe';
    }
    
    // Ásia
    if (
      timezone.includes('Asia/') ||
      timezone.includes('Tokyo') ||
      timezone.includes('Shanghai') ||
      timezone.includes('Hong_Kong')
    ) {
      return 'asia';
    }
    
    // Oceania
    if (
      timezone.includes('Australia/') ||
      timezone.includes('Pacific/Auckland') ||
      timezone.includes('Pacific/Fiji')
    ) {
      return 'oceania';
    }
    
    // África
    if (timezone.includes('Africa/')) {
      return 'africa';
    }
    
    // Padrão: Américas
    return 'americas';
  } catch (error) {
    console.error('Erro ao detectar continente:', error);
    return 'americas';
  }
}

// Detectar moeda baseada no continente
export function detectCurrency(): Currency {
  const continent = detectContinent();
  
  // Caso especial: Brasil sempre usa BRL
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('America/Sao_Paulo') || timezone.includes('America/Fortaleza')) {
      return 'BRL';
    }
  } catch (error) {
    // Ignora erro
  }
  
  return CONTINENT_CURRENCY[continent];
}

// Converter preço de BRL para moeda do usuário
export function convertPrice(priceInBRL: number, targetCurrency?: Currency): number {
  const currency = targetCurrency || detectCurrency();
  const rate = CURRENCY_RATES[currency].rate;
  
  return priceInBRL * rate;
}

// Formatar preço com símbolo da moeda
export function formatPrice(priceInBRL: number, targetCurrency?: Currency): string {
  const currency = targetCurrency || detectCurrency();
  const convertedPrice = convertPrice(priceInBRL, currency);
  const currencyInfo = CURRENCY_RATES[currency];
  
  // Formatar com locale apropriado
  const formatted = new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currencyInfo.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedPrice);
  
  return formatted;
}

// Obter informações da moeda atual
export function getCurrencyInfo(targetCurrency?: Currency): CurrencyInfo {
  const currency = targetCurrency || detectCurrency();
  return CURRENCY_RATES[currency];
}

// Obter nome do continente em português
export function getContinentName(continent?: Continent): string {
  const cont = continent || detectContinent();
  
  const names: Record<Continent, string> = {
    americas: 'Américas',
    europe: 'Europa',
    asia: 'Ásia',
    oceania: 'Oceania',
    africa: 'África',
  };
  
  return names[cont];
}
