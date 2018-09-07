import APP_CONFIG from '../../app.config';
import {NEODictionary} from './dictionary';
import {Property} from './Property';

export class Node implements d3.SimulationNodeDatum {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  id: string;
  name: string;
  linkCount = 0;
  properties: NEODictionary<string, string>;

  constructor(id, name, prop) {
    this.id = id;
    this.name = name;
    this.properties = prop;
  }

  normal = () => {
    return Math.sqrt(this.linkCount / APP_CONFIG.N);
  };

  get r() {
     return 70;
  }

  get fontSize() {
    // return (30 * this.normal() + 10) + 'px';
    return (15) + 'px';
  }

  get color() {
    const index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
    return APP_CONFIG.SPECTRUM[index];
  }
}
