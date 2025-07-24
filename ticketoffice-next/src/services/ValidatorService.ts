export interface ValidationResult {
  isValid: boolean;
  message: string;
  timestamp?: string;
}

export class ValidatorService {
  private static instance: ValidatorService;
  private baseUrl: string;

  private constructor() {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    this.baseUrl = `${BASE_URL}/api/validate`;
  }

  public static getInstance(): ValidatorService {
    if (!ValidatorService.instance) {
      ValidatorService.instance = new ValidatorService();
    }
    return ValidatorService.instance;
  }

  public async validateTicket(eventId: string, ticketId: string): Promise<ValidationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/ticket/${eventId}/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error validating ticket');
      }

      const result = await response.json();
      return {
        isValid: result.isValid,
        message: result.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error in validateTicket:', error);
      throw error;
    }
  }
}
