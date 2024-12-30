import { IgnoreCategory } from '@/services/ComparisonService';

export enum CONFIG_TARGET {
  GLOBAL,
  INTERFACE,
  DEPENDENCY,
}

export enum ExpirationType {
  PINNED_NEVER_EXPIRED,
  SOFT_TIME_EXPIRED,
}

export type ComparisonConfigInfo = {
  id: string;
  operationName: string;
  dependencyName: string;
  dependencyType: string;
  expirationDate: number;
  expirationType: ExpirationType;
};

export interface ExclusionInfo extends ComparisonConfigInfo {
  exclusionPath: string[];
}

export interface ListSortInfo extends ComparisonConfigInfo {
  listPath: string[];
  keys: string[][];
}

export interface IgnoreCategoryInfo extends ComparisonConfigInfo {
  ignoreCategoryDetail: IgnoreCategory;
}

export interface RootTransformInfo extends ComparisonConfigInfo {
  transformMethodName: string;
}
