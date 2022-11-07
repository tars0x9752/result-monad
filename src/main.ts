/**
 * ----- Types -----
 */

type Func<Parameter, Return> = (parameter: Parameter) => Return

type ResultMonad<T, E> = OkMonad<T> | ErrMonad<E>

type OkMonad<T> = {
  val: T
  context: 'Ok'
  isOk: () => true
  isErr: () => false
  fmap: <U>(func: Func<T, U>) => OkMonad<U>
  apply: <U>(func: OkMonad<Func<T, U>>) => OkMonad<U>
  chain: <U, X>(func: Func<T, ResultMonad<U, X>>) => ResultMonad<U, X>
  [Symbol.toPrimitive]: (hint: 'number' | 'string' | 'default') => any
  [Symbol.toStringTag]: () => string
}

type ErrMonad<E> = {
  val: E
  context: 'Err'
  isOk: () => false
  isErr: () => true
  fmap: <X>(func: Func<E, X>) => ErrMonad<X>
  apply: <X>(func: OkMonad<Func<E, X>>) => ErrMonad<X>
  chain: <U, X>(func: Func<E, ResultMonad<U, X>>) => ResultMonad<U, X>
  [Symbol.toPrimitive]: (hint: 'number' | 'string' | 'default') => any
  [Symbol.toStringTag]: () => string
}

type ResultContext = OkMonad<never>['context'] | ErrMonad<never>['context']

type ResultMatch<T, E, R1, R2 = R1> = {
  Ok: (p: T) => R1
  Err: (p: E) => R2
}

/**
 * ----- Core -----
 */

function ok<T>(val: T): OkMonad<T> {
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
    fmap<U>(func: Func<T, U>): OkMonad<U> {
      return ok(func(val))
    },
    apply<U>(func: OkMonad<Func<T, U>>): OkMonad<U> {
      return ok(func.val(val))
    },
    chain<U, X>(func: Func<T, ResultMonad<U, X>>): ReturnType<typeof func> {
      return func(val)
    },
    [Symbol.toPrimitive]: toPrimitive,
    [Symbol.toStringTag]: toString,
  }
}

function err<E>(val: E): ErrMonad<E> {
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
    fmap<X>(func: Func<E, X>): ErrMonad<X> {
    return err(func(val))
    },
    apply<X>(func: OkMonad<Func<E, X>>): ErrMonad<X> {
      return err(func.val(val))
    },
    chain<U, X>(func: Func<E, ResultMonad<U, X>>): ReturnType<typeof func> {
      return func(val)
    },
    [Symbol.toPrimitive]: toPrimitive,
    [Symbol.toStringTag]: toString,
  }
}

/**
 * ----- Functions -----
 */

function isErr<T, E>(result: ResultMonad<T, E>): result is ErrMonad<E> {
  return result.context === 'Err'
  }

function isOk<T, E>(result: ResultMonad<T, E>): result is OkMonad<T> {
  return result.context === 'Ok'
}

function bind<T, E, U = T, X = E>(
  result: ResultMonad<T, E>,
  binder: Func<T, ResultMonad<U, X>>
): ResultMonad<U, X> | ErrMonad<E> {
  if (isErr(result)) {
    return result
  }

  return binder(result.val)
}

function defaultValue<T, E>(result: ResultMonad<T, E>, defVal: T): T {
  if (isErr(result)) {
    return defVal
  }

  return result.val
}

function defaultWith<T, E>(result: ResultMonad<T, E>, defThunk: Func<E, T>): T {
  if (isErr(result)) {
    return defThunk(result.val)
  }

  return result.val
}

function satisfy<T, E>(result: ResultMonad<T, E>, predicate: Func<T, boolean>): boolean {
  if (isErr(result)) {
    return false
    }

  return predicate(result.val)
  }

function match<T, E, U = T, X = E>(
  result: ResultMonad<T, E>,
  matcher: ResultMatch<T, E, U, X>
): U | X {
  if (isErr(result)) {
    return matcher.Err(result.val)
  }

  return matcher.Ok(result.val)
  }

  function toString() {
    return `Err ${val.status}: ${val.message}`
  }

  return {
    val,
    context: 'Err',
    isOk: () => false,
    isErr: () => true,
    fmap,
    liftA,
    liftM,
    [Symbol.toPrimitive]: toPrimitive,
    [Symbol.toStringTag]: toString,
    $: fmap,
    '*': liftA,
    '>>=': liftM,
    b: liftM,
  }
}
