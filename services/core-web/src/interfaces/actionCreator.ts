import { AppThunk } from "@/store/appThunk.type";

/**

 A type that takes a function type T as input and returns a new type based on the output type R.
 If R is a type that extends AppThunk with a state of type S, then the ActionCreator type will be a function that takes the same arguments as T, and returns a state of type S.
 Otherwise, the ActionCreator type will be undefined.
 @typeparam T - A function type with any number and type of arguments.
 @typeparam R - A result type.
 @typeparam S - A state type.
 @return - Either a function that takes the same arguments as T, and returns a state of type S, or undefined.
 */
export type ActionCreator<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => infer R
  ? R extends AppThunk<infer S>
    ? (...args: P) => S
    : undefined
  : undefined;
