import { env } from '@/config/env';

export interface AIGeneratedOptions {
  options: Array<{
    value: string;
    label: string;
    local_context?: string;
  }>;
  sources: string[];
  confidence: number;
  notes?: string;
}

class AIProviderService {
  private useMock: boolean;
  private apiKey: string | undefined;
  private provider: 'openai' | 'anthropic' | 'google' | 'mock';

  constructor() {
    const envConfig = env.get();
    this.useMock = envConfig.VITE_USE_MOCK_AI ?? true;
    this.apiKey = envConfig.VITE_AI_PROVIDER_API_KEY;
    this.provider = envConfig.VITE_AI_PROVIDER || 'mock';
  }

  public isMockMode(): boolean {
    return this.useMock || !this.apiKey;
  }

  public getProvider(): string {
    return this.provider;
  }

  public async generateCountryOptions(
    questionKey: string,
    countryCode: string,
    prompt: string
  ): Promise<AIGeneratedOptions> {
    if (this.isMockMode()) {
      return this.mockGenerateOptions(questionKey, countryCode);
    }

    // In production, this would be called via edge function
    // This is just a placeholder for the service interface
    throw new Error('Real AI generation must be done via edge function');
  }

  private mockGenerateOptions(questionKey: string, countryCode: string): Promise<AIGeneratedOptions> {
    // Load mock data based on question type
    const mockData = this.getMockDataForQuestion(questionKey, countryCode);
    
    return Promise.resolve({
      options: mockData.options,
      sources: ['Mock Data (Development Mode)'],
      confidence: mockData.confidence,
      notes: `Mock data for ${countryCode}. Configure AI provider in Admin → Integrations for real data.`
    });
  }

  private getMockDataForQuestion(questionKey: string, countryCode: string): any {
    // Default mock data structure
    const mockDataMap: Record<string, any> = {
      household_income: {
        ZA: {
          options: [
            { value: '0-5000', label: 'R0 - R5,000', local_context: '~$0-$300 USD/month' },
            { value: '5000-10000', label: 'R5,000 - R10,000', local_context: '~$300-$600 USD/month' },
            { value: '10000-20000', label: 'R10,000 - R20,000', local_context: '~$600-$1,200 USD/month' },
            { value: '20000-40000', label: 'R20,000 - R40,000', local_context: '~$1,200-$2,400 USD/month' },
            { value: '40000+', label: 'R40,000+', local_context: '~$2,400+ USD/month' }
          ],
          confidence: 85
        },
        NG: {
          options: [
            { value: '0-50000', label: '₦0 - ₦50,000', local_context: '~$0-$110 USD/month' },
            { value: '50000-100000', label: '₦50,000 - ₦100,000', local_context: '~$110-$220 USD/month' },
            { value: '100000-200000', label: '₦100,000 - ₦200,000', local_context: '~$220-$440 USD/month' },
            { value: '200000-500000', label: '₦200,000 - ₦500,000', local_context: '~$440-$1,100 USD/month' },
            { value: '500000+', label: '₦500,000+', local_context: '~$1,100+ USD/month' }
          ],
          confidence: 85
        },
        default: {
          options: [
            { value: 'low', label: 'Low Income', local_context: 'Below median' },
            { value: 'middle', label: 'Middle Income', local_context: 'Around median' },
            { value: 'upper-middle', label: 'Upper Middle Income', local_context: 'Above median' },
            { value: 'high', label: 'High Income', local_context: 'Top bracket' }
          ],
          confidence: 70
        }
      },
      beverage_brands: {
        ZA: {
          options: [
            { value: 'coca-cola', label: 'Coca-Cola', local_context: 'Popular international brand' },
            { value: 'appletiser', label: 'Appletiser', local_context: 'Local sparkling juice brand' },
            { value: 'castle', label: 'Castle Lager', local_context: 'Popular local beer' },
            { value: 'red-bull', label: 'Red Bull', local_context: 'Energy drink' }
          ],
          confidence: 80
        },
        default: {
          options: [
            { value: 'coca-cola', label: 'Coca-Cola', local_context: 'Global brand' },
            { value: 'pepsi', label: 'Pepsi', local_context: 'Global brand' },
            { value: 'local-juice', label: 'Local Juice Brands', local_context: 'Regional options' }
          ],
          confidence: 70
        }
      },
      default: {
        options: [
          { value: 'option1', label: 'Option 1', local_context: 'Mock option' },
          { value: 'option2', label: 'Option 2', local_context: 'Mock option' },
          { value: 'option3', label: 'Option 3', local_context: 'Mock option' }
        ],
        confidence: 65
      }
    };

    // Try to find question-specific data for the country
    const questionData = mockDataMap[questionKey] || mockDataMap.default;
    return questionData[countryCode] || questionData.default || mockDataMap.default;
  }
}

export const aiProviderService = new AIProviderService();
