declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
    stdout: {
      write(str: string): boolean;
    };
  }
}

declare const process: NodeJS.Process;

declare module 'async_hooks' {
  export class AsyncLocalStorage<T> {
    disable(): void;
    getStore(): T | undefined;
    run<R>(store: T, callback: (...args: any[]) => R, ...args: any[]): R;
    enterWith(store: T): void;
  }
}

declare module 'dotenv' {
  export interface DotenvConfigOptions {
    path?: string;
    encoding?: string;
    debug?: boolean;
    override?: boolean;
  }
  export interface DotenvConfigOutput {
    error?: Error;
    parsed?: Record<string, string>;
  }
  export function config(options?: DotenvConfigOptions): DotenvConfigOutput;
}

declare module 'zod' {
  export interface ZodIssue {
    code: string;
    message: string;
    path: (string | number)[];
  }
  export interface ZodError {
    issues: ZodIssue[];
  }
  export interface SafeParseSuccess<T> {
    success: true;
    data: T;
  }
  export interface SafeParseError {
    success: false;
    error: ZodError;
  }
  export type SafeParseResult<T> = SafeParseSuccess<T> | SafeParseError;

  export interface ZodType<T = any> {
    parse(data: unknown): T;
    safeParse(data: unknown): SafeParseResult<T>;
    default(def: any): ZodType<T>;
    optional(): ZodType<T | undefined>;
    transform<U>(fn: (val: any) => U): ZodType<U>;
    pipe<U>(target: ZodType<U>): ZodType<U>;
  }

  export interface ZodString extends ZodType<string> {
    url(): ZodString;
    transform<U>(fn: (val: string) => U): ZodType<U>;
  }

  export interface ZodNumber extends ZodType<number> {
    min(n: number): ZodNumber;
    max(n: number): ZodNumber;
  }

  export interface ZodEnum<T extends readonly [string, ...string[]]> extends ZodType<T[number]> {
    default(def: T[number]): ZodEnum<T>;
  }

  export interface ZodObject<T extends Record<string, ZodType<any>>> extends ZodType<any> {}

  export namespace z {
    export type infer<T> = any;
  }

  export const z: {
    string(): ZodString;
    number(): ZodNumber;
    enum<T extends readonly [string, ...string[]]>(values: T): ZodEnum<T>;
    object<T extends Record<string, ZodType<any>>>(shape: T): ZodObject<T>;
  };
}
