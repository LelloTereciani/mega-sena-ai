import { MEGA_SENA_CONFIG } from './constants';

export const validateMegaSenaNumbers = (numbers) => {
  if (!Array.isArray(numbers)) return false;
  if (numbers.length !== MEGA_SENA_CONFIG.NUMBERS_PER_GAME) return false;
  
  const allValid = numbers.every(num => {
    return (
      typeof num === 'number' &&
      !isNaN(num) &&
      num >= MEGA_SENA_CONFIG.MIN_NUMBER &&
      num <= MEGA_SENA_CONFIG.MAX_NUMBER
    );
  });
  
  if (!allValid) return false;
  
  const unique = new Set(numbers);
  return unique.size === numbers.length;
};

export const validateFile = (file) => {
  const validExtensions = ['.txt', '.xlsx', '.xls'];
  const maxSize = 10 * 1024 * 1024;
  
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  
  if (!validExtensions.includes(extension)) {
    return { valid: false, error: 'Use arquivo .txt, .xlsx ou .xls' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Arquivo muito grande (máx 10MB)' };
  }
  
  return { valid: true };
};
