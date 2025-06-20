declare module 'ml-svm' {
  export class SVC {
    constructor(options?: any);
    train(features: number[][], labels: number[]): void;
    predict(features: number[]): number;
    predictProbability(features: number[]): number[];
  }
}

declare module 'ml-knn' {
  export class KNN {
    constructor(options?: any);
    train(features: number[][], labels: number[]): void;
    predict(features: number[]): number;
    predictProbability(features: number[]): number[];
  }
}

declare module 'ml-naivebayes' {
  export class GaussianNB {
    train(features: number[][], labels: number[]): void;
    predict(features: number[]): number;
    predictProbability(features: number[]): number[];
  }
}

declare module 'ml-xgboost' {
  export class XGBoost {
    constructor(options?: any);
    train(features: number[][], labels: number[]): void;
    predict(features: number[]): number;
    predictProbability(features: number[]): number[];
  }
}

declare module 'ml-random-forest' {
  export class RandomForestClassifier {
    constructor(options?: any);
    train(features: number[][], labels: number[]): void;
    predict(features: number[]): number;
    predictProbabilities(features: number[]): number[];
  }
}
