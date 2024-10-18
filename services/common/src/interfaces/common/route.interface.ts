export interface CoreRoute {
  route: string;
  component: React.LazyExoticComponent<React.FC> | React.FC;
  dynamicRoute?: (...args) => string;
  hashRoute?: (...args) => string;
  priority?: number;
  helpKey?: string;
}
