declare module 'shap' {
  export class DeepExplainer {
    constructor(model: any, backgroundData: any);
    explain(features: number[]): Promise<number[]>;
  }
}
