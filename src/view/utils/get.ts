import { ObjectOfNumbers, Vector } from 'persistance/editor/base-types';
import { MutableRefObject } from 'react';

export const get = <T = HTMLElement>(query: string, element = document): T | undefined => {
  const searched: unknown = element.querySelector(query);
  if (searched) {
    return searched as T;
  }

  return undefined;
};

export const getParsedStyle = (element: Element, ...valueNames: string[]): ObjectOfNumbers => {
  if (element) {
    const style: CSSStyleDeclaration = window.getComputedStyle(element);
    const parsed: ObjectOfNumbers = {};
    valueNames.forEach((name: string) => {
      const rule = style[name as keyof CSSStyleDeclaration];
      if (!rule) return;

      const ruleValue = Math.ceil(parseFloat(rule as string));
      parsed[name] = ruleValue;
    });

    return parsed;
  }

  return {};
};

export const getScreenCenterCoords = (): Vector => {
  const style = getParsedStyle(document.body, 'width', 'height');

  return {
    x: style.width * 0.5,
    y: style.height * 0.5,
  };
};

export const getTwoPointsDistance = (p1: Vector, p2: Vector): number => {
  const a = p1.x - p2.x;
  const b = p1.y - p2.y;

  return Math.sqrt(a * a + b * b);
};

export const getWindowInnerSize = (): Vector => {
  const x =
    window.innerWidth && document.documentElement.clientWidth
      ? Math.min(window.innerWidth, document.documentElement.clientWidth)
      : document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
  const y =
    window.innerHeight && document.documentElement.clientHeight
      ? Math.min(window.innerHeight, document.documentElement.clientHeight)
      : document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;

  return { x, y };
};

export const getSafeRef = <T = HTMLElement>(ref: MutableRefObject<null>): T | null => {
  if (ref && ref.current) {
    return ref.current as T;
  }

  return null;
};
