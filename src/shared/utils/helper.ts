export const validateEmail = (email:string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const addThousandsSeparator = (num:number) => {
  const [integerPart, fractionalPart] = num.toString().split(".");
  const formattedInteger = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
};