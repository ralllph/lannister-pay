export const calculateTotalRatio = (arr: any[]) => {
  let total = 0;
  for (let element of arr) {
    if (element.SplitType.toLowerCase() === 'ratio') {
      total += element.SplitValue;
    }
  }
  return total;
};
