/**
 * ----- ResultMonad -----
 */
type Func<Parameter, Return> = (parameter: Parameter) => Return

type ResultMonad<T, E> = OkMonad<T> | ErrMonad<E>

interface OkMonad<T> {
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

interface ErrMonad<E> {
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

function isErr<T, E>(result: ResultMonad<T, E>): result is ErrMonad<E> {
  return result.context === 'Err'
}

function isOk<T, E>(result: ResultMonad<T, E>): result is OkMonad<T> {
  return result.context === 'Ok'
}

function ok<T>(val: T): OkMonad<T> {
  function toPrimitive(_hint: 'number' | 'string' | 'default') {
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
  function toPrimitive(_hint: 'number' | 'string' | 'default') {
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
  }

  function liftA<U, X extends ErrStatus>(rFunc: ResultMonad<(v: E) => U, X>): ResultMonad<U, X> {
    if (isErr(rFunc)) {
      return rFunc
    }

    return ok(rFunc.val(val))
  }

  function liftM<U, X extends ErrStatus>(mFunc: (v: E) => ResultMonad<U, X>): ResultMonad<U, X> {
    return mFunc(val)
  }

  function toPrimitive(_hint: 'number' | 'string' | 'default') {
    return `Err ${val.status}: ${val.message}`
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
