import { Node } from './';
import {NEODictionary} from './dictionary';

export class Link implements d3.SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;

  // must - defining enforced implementation properties
  source: Node | string | number;
  target: Node | string | number;
  name: string;
  properties: NEODictionary<string, string>;


  constructor(source, target, name, properties) {
    this.source = source;
    this.target = target;
    this.name = name;
    this.properties = properties;
  }

  get fontSize() {
    // return (30 * this.normal() + 10) + 'px';
    return (15) + 'px';
  }
}
