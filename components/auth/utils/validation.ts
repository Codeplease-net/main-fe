/**
 * Validates that a password meets security requirements
 */
export const validatePassword = (password: string): boolean => {
    // At least 8 characters, with at least one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };
  
  /**
   * Validates that a user is at least 13 years old
   */
  export const validateBirthdate = (birthdate: string): boolean => {
    if (!birthdate) return false;
    
    const today = new Date();
    const birthdateDate = new Date(birthdate);
    const age = today.getFullYear() - birthdateDate.getFullYear();
    const monthDiff = today.getMonth() - birthdateDate.getMonth();
    
    // If birth month is after current month or birth month is current month but birth day is after today
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateDate.getDate())) {
      return age - 1 >= 5; // Subtract 1 from age
    }
    
    return age >= 5;
  };