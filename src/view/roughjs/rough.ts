import { RoughCanvas } from './canvas';
import { Config } from './core';
import { RoughGenerator } from './generator';

export default {
  canvas(canvas: HTMLCanvasElement, config?: Config): RoughCanvas {
    return new RoughCanvas(canvas, config);
  },

  generator(config?: Config): RoughGenerator {
    return new RoughGenerator(config);
  },

  newSeed(): number {
    return RoughGenerator.newSeed();
  },
};
