/* eslint-disable */

// @ts-ignore
import FormulaParse from 'fast-formula-parser';

function stackDepth() {
  // @ts-ignore
  return (new Error()).stack.split('\n').length;
}

const buildParser = (data: any) => new FormulaParse({
  onCell({ sheet, row, col }: {sheet: any, row: number, col: number}) {
    let res = data[row - 1][col - 1];
    if (typeof res === 'string' && res.startsWith('=')) {
      console.log('EVAL', res);
      res = this.parse(res.slice(1));
    }
    const parsedNumber = Number.parseInt(res);
    if (isNaN(parsedNumber)) {
      console.log('NAN', { row, col }, parsedNumber, stackDepth());
      return res;
    }
    console.log('NUMBER', { row, col }, parsedNumber, stackDepth());
    return parsedNumber;
  },
  onRange(ref: any) {
    const arr = [];
    for (let row = ref.from.row; row <= ref.to.row; row++) {
      const innerArr = [];
      if (data[row - 1]) {
        for (let col = ref.from.col; col <= ref.to.col; col++) {
          let res = data[row - 1][col - 1];
          if (typeof res === 'string' && res.startsWith('=')) {
            res = this.parse(res.slice(1));
          }
          // console.log("Range", res)
          innerArr.push(res);
        }
      }
      arr.push(innerArr);
    }

    return arr;
  },
});

export default buildParser;
