import Core from './../core';
import { isObject } from './../helpers/object';
import IndexMapper from './indexMapper';

/**
 * @class RecordTranslator
 * @util
 */
export class RecordTranslator {
  constructor(hot) {
    this.hot = hot;
    this.rowIndexMapper = new IndexMapper();
    this.columnIndexMapper = new IndexMapper();
  }

  /**
   * Translate physical row index into visual.
   *
   * @param {Number} row Physical row index.
   * @returns {Number} Returns visual row index.
   */
  toVisualRow(row) {
    return this.hot.runHooks('unmodifyRow', this.rowIndexMapper.getVisualIndex(row));
  }

  /**
   * Translate physical column index into visual.
   *
   * @param {Number} column Physical column index.
   * @returns {Number} Returns visual column index.
   */
  toVisualColumn(column) {
    return this.hot.runHooks('unmodifyCol', this.columnIndexMapper.getVisualIndex(column));
  }

  /**
   * Translate physical coordinates into visual. Can be passed as separate 2 arguments (row, column) or as an object in first
   * argument with `row` and `column` keys.
   *
   * @param {Number|Object} row Physical coordinates or row index.
   * @param {Number} [column] Physical column index.
   * @returns {Object|Array} Returns an object with visual records or an array if coordinates passed as separate arguments.
   */
  toVisual(row, column) {
    let result;

    if (isObject(row)) {
      result = {
        row: this.toVisualRow(row.row),
        column: this.toVisualColumn(row.column),
      };
    } else {
      result = [this.toVisualRow(row), this.toVisualColumn(column)];
    }

    return result;
  }

  /**
   * Translate visual row index into physical.
   *
   * @param {Number} row Visual row index.
   * @returns {Number} Returns physical row index.
   */
  toPhysicalRow(row) {
    return this.hot.runHooks('modifyRow', this.rowIndexMapper.getPhysicalIndex(row));
  }

  /**
   * Translate visual column index into physical.
   *
   * @param {Number} column Visual column index.
   * @returns {Number} Returns physical column index.
   */
  toPhysicalColumn(column) {
    return this.hot.runHooks('modifyCol', this.columnIndexMapper.getPhysicalIndex(column));
  }

  /**
   * Translate visual coordinates into physical. Can be passed as separate 2 arguments (row, column) or as an object in first
   * argument with `row` and `column` keys.
   *
   * @param {Number|Object} row Visual coordinates or row index.
   * @param {Number} [column] Visual column index.
   * @returns {Object|Array} Returns an object with physical records or an array if coordinates passed as separate arguments.
   */
  toPhysical(row, column) {
    let result;

    if (isObject(row)) {
      result = {
        row: this.toPhysicalRow(row.row),
        column: this.toPhysicalColumn(row.column),
      };
    } else {
      result = [this.toPhysicalRow(row), this.toPhysicalColumn(column)];
    }

    return result;
  }

  /**
   * Get list of row indexes skipped in the process of rendering.
   *
   * @returns {Array}
   */
  getSkippedRows() {
    return this.rowIndexMapper.getSkippedIndexes();
  }

  /**
   * Get list of column indexes skipped in the process of rendering.
   *
   * @returns {Array}
   */
  getSkippedColumns() {
    return this.columnIndexMapper.getSkippedIndexes();
  }

  /**
   * Get whether row index is skipped in the process of rendering.
   *
   * @param row  Physical row index.
   * @returns {Boolean}
   */
  isSkippedRow(row) {
    return this.rowIndexMapper.isSkipped(row);
  }

  /**
   * Get whether column index is skipped in the process of rendering.
   *
   * @param column Physical column index.
   * @returns {Boolean}
   */
  isSkippedColumn(column) {
    return this.columnIndexMapper.isSkipped(column);
  }

  /**
   * Set completely new list of row indexes skipped in the process of rendering.
   *
   * @param {Array} Physical row indexes.
   */
  setSkippedRows(indexes) {
    this.rowIndexMapper.setSkippedIndexes(indexes);
  }

  /**
   * Set completely new list of column indexes skipped in the process of rendering.
   *
   * @param {Array} Physical column indexes.
   */
  setSkippedColumns(indexes) {
    this.columnIndexMapper.setSkippedIndexes(indexes);
  }
}

const identities = new WeakMap();
const translatorSingletons = new WeakMap();

/**
 * Allows to register custom identity manually.
 *
 * @param {*} identity
 * @param {*} hot
 */
export function registerIdentity(identity, hot) {
  identities.set(identity, hot);
}

/**
 * Returns a cached instance of RecordTranslator or create the new one for given identity.
 *
 * @param {*} identity
 * @returns {RecordTranslator}
 */
export function getTranslator(identity) {
  const instance = identity instanceof Core ? identity : getIdentity(identity);
  let singleton;

  if (translatorSingletons.has(instance)) {
    singleton = translatorSingletons.get(instance);

  } else {
    singleton = new RecordTranslator(instance);
    translatorSingletons.set(instance, singleton);
  }

  return singleton;
}

/**
 * Returns mapped identity.
 *
 * @param {*} identity
 * @returns {*}
 */
export function getIdentity(identity) {
  if (!identities.has(identity)) {
    throw Error('Record translator was not registered for this object identity');
  }

  return identities.get(identity);
}