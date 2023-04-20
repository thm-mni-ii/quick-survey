import structuredClone from '@ungap/structured-clone';

/**
 * Manage undos and redos for type T
 */
export class UndoManager<T> {
  private actionStack: T[] = [];
  private redoStack: T[] = [];

  /**
     * Pushes a new change
     * @param {Object} o the change
     */
  push(o: T) {
    this.actionStack.push(structuredClone(o));
    this.redoStack = [];
  }

  /**
     * Undos the last change
     * @return {Object} the state after undoing
     */
  undo(): T|undefined {
    const lastAction = this.actionStack.pop();
    if (!lastAction) return;
    this.redoStack.push(lastAction);
    return structuredClone(this.actionStack[this.actionStack.length-1]);
  }

  /**
     * Redos the last undo
     * @return {Object} the state after redoing
     */
  redo(): T|undefined {
    const lastAction = this.redoStack.pop();
    if (!lastAction) return;
    this.actionStack.push(lastAction);
    return structuredClone(lastAction);
  }
}
