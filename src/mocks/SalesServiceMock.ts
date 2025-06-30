import { SalesResponse } from '../types/Sales';

export class SalesServiceMock {
  public static getMockSales(): SalesResponse {
    return {
      sales: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          ticketType: "VIP",
          price: 150.5,
          validated: true
        },
        {
          id: "234f5678-f90a-23b4-c567-890123456789",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          ticketType: "General",
          price: 100.0,
          validated: false
        },
        {
          id: "345g6789-g01b-34c5-d678-901234567890",
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike.johnson@example.com",
          ticketType: "VIP",
          price: 150.5,
          validated: true
        }
      ]
    };
  }
}
