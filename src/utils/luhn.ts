// The Luhn algorithm is a checksum algorithm commonly used to validate payment card numbers.
// Let's take:
// 4111 1111 1111 1111


// First, remove spaces and obtain:
// 4111111111111111


// Then:
// 1. Start from the rightmost digit.
// 2. Double every second digit.
// 3. If a doubled value is greater than 9, subtract 9.
// 4. Add all the resulting digits.
// 5. Check whether the sum is divisible by 10.
// If:
// sum % 10 === 0


// The number passes Luhn validation.

// Luhn validation doesn't prove that a card exists or is active. It only checks whether its number passes the checksum.

export function isValidLuhnNumber(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index--) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
