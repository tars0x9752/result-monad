/**
 * ----- Types -----
 */

type Func<Parameter, Return> = (parameter: Parameter) => Return

export type Result<T, E> = Ok<T> | Err<E>

export type Ok<T> = {
  val: T
  context: 'Ok'
  isOk: () => true
  isErr: () => false
  fmap: <U>(func: Func<T, U>) => Ok<U>
  apply: <U>(func: Ok<Func<T, U>>) => Ok<U>
  chain: <U, X>(func: Func<T, Result<U, X>>) => Result<U, X>
  [Symbol.toPrimitive]: (hint: 'number' | 'string' | 'default') => any
  [Symbol.toStringTag]: () => string
}

export type Err<E> = {
  val: E
  context: 'Err'
  isOk: () => false
  isErr: () => true
  fmap: <X>(func: Func<E, X>) => Err<X>
  apply: <X>(func: Ok<Func<E, X>>) => Err<X>
  chain: <U, X>(func: Func<E, Result<U, X>>) => Result<U, X>
  [Symbol.toPrimitive]: (hint: 'number' | 'string' | 'default') => any
  [Symbol.toStringTag]: () => string
}

export type ResultContext = Result<never, never>['context']

export type ResultMatch<T, E, R1, R2 = R1> = {
  Ok: (p: T) => R1
  Err: (p: E) => R2
}

/**
 * ----- Core -----
 */

export function ok<T>(val: T): Ok<T> {
  function toPrimitive(hint: 'number' | 'string' | 'default') {
    if (hint === 'number') {
      // 1 for ok, 0 for err
      return 1
    }

    if (typeof val === 'number') {
      return val
    }

    if (typeof val === 'boolean') {
      return val
    }

    return `Ok ${val}`
  }

  function toString() {
    return `Ok ${val}`
  }

  return {
    val,
    context: 'Ok',
    isOk: () => true,
    isErr: () => false,
    fmap<U>(func: Func<T, U>): Ok<U> {
      return ok(func(val))
    },
    apply<U>(func: Ok<Func<T, U>>): Ok<U> {
      return ok(func.val(val))
    },
    chain<U, X>(func: Func<T, Result<U, X>>): ReturnType<typeof func> {
      return func(val)
    },
    [Symbol.toPrimitive]: toPrimitive,
    [Symbol.toStringTag]: toString,
  }
}

export function err<E>(val: E): Err<E> {
  function toPrimitive(hint: 'number' | 'string' | 'default') {
    if (hint === 'number') {
      // 1 for ok, 0 for err
      return 0
    }

    return `Err ${val}`
  }

  function toString() {
    return `Err ${val}`
  }

  return {
    val,
    context: 'Err',
    isOk: () => false,
    isErr: () => true,
    fmap<X>(func: Func<E, X>): Err<X> {
      return err(func(val))
    },
    apply<X>(func: Ok<Func<E, X>>): Err<X> {
      return err(func.val(val))
    },
    chain<U, X>(func: Func<E, Result<U, X>>): ReturnType<typeof func> {
      return func(val)
    },
    [Symbol.toPrimitive]: toPrimitive,
    [Symbol.toStringTag]: toString,
  }
}

/**
 * ----- Functions -----
 */

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.context === 'Err'
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.context === 'Ok'
}

export function bind<T, E, U = T, X = E>(
  result: Result<T, E>,
  binder: Func<T, Result<U, X>>
): Result<U, X> | Err<E> {
  if (isErr(result)) {
    return result
  }

  return binder(result.val)
}

export function defaultValue<T, E>(result: Result<T, E>, defVal: T): T {
  if (isErr(result)) {
    return defVal
  }

  return result.val
}

export function defaultWith<T, E>(result: Result<T, E>, defThunk: Func<E, T>): T {
  if (isErr(result)) {
    return defThunk(result.val)
  }

  return result.val
}

export function satisfy<T, E>(result: Result<T, E>, predicate: Func<T, boolean>): boolean {
  if (isErr(result)) {
    return false
  }

  return predicate(result.val)
}

export function match<T, E, U = T, X = E>(
  result: Result<T, E>,
  matcher: ResultMatch<T, E, U, X>
): U | X {
  if (isErr(result)) {
    return matcher.Err(result.val)
  }

  return matcher.Ok(result.val)
}
