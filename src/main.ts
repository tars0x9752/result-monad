/**
 * ----- Types -----
 */

type Func<Parameter, Return> = (parameter: Parameter) => Return

export type Result<OkValue, ErrValue> = Ok<OkValue> | Err<ErrValue>

export type Ok<T> = {
  val: T
  context: 'Ok'
  is_Ok: true
  is_Err: false
  fmap: <U>(func: Func<T, U>) => Ok<U>
  apply: <U>(func: Ok<Func<T, U>>) => Ok<U>
  chain: <U, X>(func: Func<T, Result<U, X>>) => Result<U, X>
  [Symbol.toPrimitive]: (hint: 'number' | 'string' | 'default') => any
  [Symbol.toStringTag]: () => string
}

export type Err<E> = {
  val: E
  context: 'Err'
  is_Ok: false
  is_Err: true
  fmap: <X>(func: Func<E, X>) => Err<X>
  apply: <X>(func: Ok<Func<E, X>>) => Err<X>
  chain: <U, X>(func: Func<E, Result<U, X>>) => Result<U, X>
  [Symbol.toPrimitive]: (hint: 'number' | 'string' | 'default') => any
  [Symbol.toStringTag]: () => string
}

export type ResultContext = Result<never, never>['context']

export type ResultMatch<OkValue, ErrValue, OkReturn, ErrReturn = OkReturn> = {
  Ok: Func<OkValue, OkReturn>
  Err: Func<ErrValue, ErrReturn>
}

/**
 * ----- Core -----
 */

export function ok<T>(val: T): Ok<T> {
  return {
    val,
    context: 'Ok',
    is_Ok: true,
    is_Err: false,
    fmap<U>(func: Func<T, U>): Ok<U> {
      return ok(func(val))
    },
    apply<U>(func: Ok<Func<T, U>>): Ok<U> {
      return ok(func.val(val))
    },
    chain<U, X>(func: Func<T, Result<U, X>>): ReturnType<typeof func> {
      return func(val)
    },
    [Symbol.toPrimitive](hint: 'number' | 'string' | 'default') {
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
    },
    [Symbol.toStringTag]() {
      return `Ok ${val}`
    },
  }
}

export function err<E>(val: E): Err<E> {
  return {
    val,
    context: 'Err',
    is_Ok: false,
    is_Err: true,
    fmap<X>(func: Func<E, X>): Err<X> {
      return err(func(val))
    },
    apply<X>(func: Ok<Func<E, X>>): Err<X> {
      return err(func.val(val))
    },
    chain<U, X>(func: Func<E, Result<U, X>>): ReturnType<typeof func> {
      return func(val)
    },
    [Symbol.toPrimitive](hint: 'number' | 'string' | 'default') {
      if (hint === 'number') {
        // 1 for ok, 0 for err
        return 0
      }

      return `Err ${val}`
    },
    [Symbol.toStringTag]() {
      return `Err ${val}`
    },
  }
}

/**
 * ----- Functions -----
 */

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.is_Err
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.is_Ok
}

export function bind<T, E, U = T, X = E>(
  result: Result<T, E>,
  binder: Func<T, Result<U, X>>
): Result<U, X> | Err<E> {
  if (result.is_Err) {
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
