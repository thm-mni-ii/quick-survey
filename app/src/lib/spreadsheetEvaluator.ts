/**
 * Performs and caches spreadsheet evaluations
 */
export class SpreadsheetEvaluator {
  private i = 0;
  private cache: any[][] = [];

  /**
   * Run the evaluation spreadsheet evaluation with the given cells
   * @param {Array} cells the cells to evaluate
   */
  async evaluate(cells: any[][]): Promise<void> {
    const i = this.i + 1;
    this.i = i;
    const evaluated = await fetch(import.meta.env.VITE_EVALUATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cells }),
    }).then((res) => res.json());
    if (this.i <= i) {
      this.cache = evaluated.cells;
      this.i = i;
    }
  }

  /**
   * Gets the evaluated value at row and colum
   * @param {number} row the row
   * @param {number} col the column
   * @return {number|string} the evaluated value at row and colum
   */
  get(row: number, col: number): any {
    const r = this.cache[row];
    if (!r) return;
    return r[col];
  }
}
