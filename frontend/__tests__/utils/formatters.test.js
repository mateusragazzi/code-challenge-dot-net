import { formatDate } from '../../src/utils/formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    beforeAll(() => {
      const originalToLocaleString = Date.prototype.toLocaleString;
      
      Date.prototype.toLocaleString = function(locale, options) {
        if (locale === 'en-US' && 
            options.month === '2-digit' &&
            options.day === '2-digit' &&
            options.year === 'numeric' &&
            options.hour === '2-digit' &&
            options.minute === '2-digit' &&
            options.hour12 === true) {
          
          const date = this;
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const year = date.getFullYear();
          const hours = date.getHours();
          const hour12 = hours % 12 || 12;
          const hour = String(hour12).padStart(2, '0');
          const minute = String(date.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          
          return `${month}/${day}/${year}, ${hour}:${minute} ${ampm}`;
        }
        
        return originalToLocaleString.call(this, locale, options);
      };
    });
    
    it('returns "N/A" for null or undefined values', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
      expect(formatDate('')).toBe('N/A');
    });
    
    it('formats date correctly', () => {
      const dateString = '2023-04-15T14:30:00Z';
      const result = formatDate(dateString);
      
      expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} [AP]M$/);
      
      const expectedDate = new Date(dateString);
      const expected = expectedDate.toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      expect(formatDate(dateString)).toBe(expected);
    });
    
    it('formats a specific date with mocked Date constructor', () => {
      const fixedDate = new Date(2023, 3, 15, 10, 30);
      
      const originalDate = global.Date;
      global.Date = jest.fn(() => fixedDate);
      global.Date.UTC = originalDate.UTC;
      global.Date.parse = originalDate.parse;
      global.Date.now = originalDate.now;
      
      const expected = "04/15/2023, 10:30 AM";
      
      expect(formatDate("any-date-string")).toBe(expected);
      
      global.Date = originalDate;
    });
  });
}); 