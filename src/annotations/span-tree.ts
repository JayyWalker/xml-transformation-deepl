import { cloneDeep } from 'lodash';

/**
 * Represents something with a start and an end
 *
 * This type is used as a generic constraint for SpanTree
 */
export interface Span {
  index: number;
  length: number;
}

/**
 * A single item in a span tree. Can have children of the same type
 */
export interface SpanTreeNode<T extends Span> {
  item: T;
  children: SpanTreeNode<T>[];
}

/**
 * The top level part of a span tree
 */
export type SpanTree<T extends Span> = SpanTreeNode<T>[];

const orderNodes = <T extends Span>(left: T, right: T) => {
  return left.index - right.index;
};

/**
 * Sort list of annotations on length and index
 * @param spans
 * @returns a sorted list
 */
export function sortSpanList<T extends Span>(spans: T[]) {
  spans.sort((a, b) => {
    if (a.index === b.index) {
      // length is only important when b.index is equal to a.index
      return b.length - a.length;
    }
    return a.index - b.index;
  });
  return spans;
}

/**
 * Create a span tree from a collection of spans
 */
export function createSpanTree<T extends Span>(spans: T[]): SpanTree<T> {
  const tree: SpanTree<T> = [];
  const queue = sortSpanList(spans);
  while (queue.length > 0) {
    const annotation = queue.shift() as T;
    addSpanToTree(tree, annotation, queue);
  }
  // Sort the tree
  sortTree(tree, orderNodes);

  return tree;
}

/**
 * Add additional spans into an existing tree
 */
export function addSpansToTree<T extends Span>(tree: SpanTree<T>, spans: T[]) {
  const queue = cloneDeep(spans);
  while (queue.length > 0) {
    const annotation = queue.shift() as T;
    addSpanToTree(tree, annotation, queue);
  }

  sortTree(tree, orderNodes);
}

/**
 * Check whether one span overlaps another in any way
 * @returns true if the spans overlap
 */
export function isOverlapping(span1: Span, span2: Span): boolean {
  let start1 = span1.index;
  let end1 = span1.index + span1.length;
  let start2 = span2.index;
  let end2 = span2.index + span2.length;

  return start1 < end2 && end1 > start2;
}

/**
 * Checks whether one span is completely within another
 * @returns true if one span is wholely inside the other
 */
export function isFullyEnclosed(span1: Span, span2: Span): boolean {
  let start1 = span1.index;
  let end1 = span1.index + span1.length;
  let start2 = span2.index;
  let end2 = span2.index + span2.length;
  return start2 >= start1 && end2 <= end1;
}

function addSpanToNode<T extends Span>(node: SpanTreeNode<T>, span: T, queue: T[]) {
  let addedToNode = addSpanToNodes(node.children, span, queue);
  if (!addedToNode) {
    node.children.push({ item: span, children: [] });
  }
}

function addSpanToNodes<T extends Span>(nodes: SpanTreeNode<T>[], span: T, queue: T[]): boolean {
  for (let node of nodes) {
    if (isFullyEnclosed(node.item, span)) {
      addSpanToNode(node, span, queue);
      return true;
    } else if (isOverlapping(node.item, span)) {
      const newAnnotation = sliceSpan(node.item, span);
      // Push the remaining annotation back into the queue
      queue.push(newAnnotation.remainingAnnotation);
      // Add the split part of the annotation that overlapped to the node
      addSpanToNode(node, newAnnotation.splitAnnotation, queue);
      return true;
    }
  }
  return false;
}

/**
 * Add an span into a tree
 * @param tree
 * @param span
 * @param queue A queue to hold any spans created as a result of one being sliced to fit into another
 */
export function addSpanToTree<T extends Span>(tree: SpanTree<T>, span: T, queue: T[]) {
  let addedToNode = addSpanToNodes(tree, span, queue);
  if (!addedToNode) {
    // If they don't overlap at all, add the annotation to the tree
    tree.push({ item: span, children: [] });
  }
}

/**
 * Split a span into 2 parts; the first which overlaps node and the rest
 * @param owningSpan The owning span. Used to work out where the span should be split
 * @param newSpan The span to split
 * @returns both parts of the split span
 */
export function sliceSpan<T extends Span>(owningSpan: T, newSpan: T): { [key: string]: T } {
  const splitAnnotationLength = owningSpan.index + owningSpan.length - newSpan.index;
  return {
    splitAnnotation: {
      ...cloneDeep(newSpan),
      index: newSpan.index,
      length: splitAnnotationLength,
    },
    remainingAnnotation: {
      ...cloneDeep(newSpan),
      index: owningSpan.index + owningSpan.length,
      length: newSpan.length - splitAnnotationLength,
    },
  };
}

/**
 * Map one tree to another using function f
 */
export function map<T extends Span, Return extends Span>(tree: SpanTree<T>, f: (n: T) => Return): SpanTree<Return> {
  function mapNode(item: SpanTreeNode<T>): SpanTreeNode<Return> {
    return {
      item: f(item.item),
      children: item.children.map(mapNode),
    };
  }
  return tree.map(mapNode);
}

/**
 * Sort each item in the tree as well as each items children using the supplied function
 */
export function sortTree<T extends Span>(tree: SpanTree<T>, sortFn: (left: T, right: T) => number) {
  const sorter = (left: SpanTreeNode<T>, right: SpanTreeNode<T>) => sortFn(left.item, right.item);
  function sortChild(item: SpanTreeNode<T>) {
    item.children.sort(sorter);
    item.children.forEach(sortChild);
  }
  tree.sort(sorter);
  tree.forEach(sortChild);
}

/**
 * Convert a tree into an array. The supplied function converts each item into a pair (start & end)
 * which are wrapped around the result for all of the children.
 *
 * e.g.
 *
 * With a flatten function converting 'ab' into ['a', 'b']:
 *
 * ```
 * [{
 *   item: 'ab',
 *   children: [{
 *     item: 'cd',
 *     children: []
 *   }]
 * }]
 * ```
 *
 * is converted into `'acdb'`.
 *
 * Ignores any item for which the function returns `undefined`
 * @param tree A tree of spans
 * @param flattenFn A function which takes a span & converts it into a pair or undefined
 * @returns
 */
export function flatten<T extends Span, FlattenedType>(
  tree: SpanTree<T>,
  flattenFn: (item: T) => [FlattenedType, FlattenedType] | undefined,
): FlattenedType[] {
  function flattenNode(item: SpanTreeNode<T>): FlattenedType[] {
    const flatItem = flattenFn(item.item);
    if (flatItem) {
      const [start, end] = flatItem;
      return [start, ...item.children.flatMap(flattenNode), end];
    } else {
      return item.children.flatMap(flattenNode);
    }
  }

  return tree.flatMap(flattenNode);
}
