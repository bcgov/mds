import { AppThunk } from "@/store/appThunk.type";

export type ACType<T extends (...args: any[]) => any> = T extends (...args: infer P) => infer R
  ? R extends AppThunk<infer S>
    ? (...args: P) => S
    : undefined
  : undefined;
