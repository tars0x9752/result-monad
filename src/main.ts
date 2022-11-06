/**
 * ----- ResultMonad -----
 */

type ErrStatus = {
  status: string
  message: string
}

type ResultMonad<T, E extends ErrStatus> = OkMonad<T> | ErrMonad<E>

type ResultContext = ResultMonad<never, never>['context']

type OkMonad<T> = {
  val: T
  context: 'Ok'
  isOk: () => true
  isErr: () => false
  fmap: <U>(func: (v: T) => U) => OkMonad<U>
  liftA: <U, E extends ErrStatus>(rFunc: ResultMonad<(v: T) => U, E>) => ResultMonad<U, E>
  liftM: <U, E extends ErrStatus>(mFunc: (v: T) => ResultMonad<U, E>) => ResultMonad<U, E>

  // --- alias ---
  $: OkMonad<T>['fmap']
  '*': OkMonad<T>['liftA']
  '>>=': OkMonad<T>['liftM']
  b: OkMonad<T>['liftM']
}

type ErrMonad<E extends ErrStatus> = {
  val: E
  context: 'Err'
  isOk: () => false
  isErr: () => true
  fmap: <X extends ErrStatus>(func: (e: E) => X) => ErrMonad<X>
  liftA: <U, X extends ErrStatus>(rFunc: ResultMonad<(v: E) => U, X>) => ResultMonad<U, X>
  liftM: <U, X extends ErrStatus>(func: (e: E) => ResultMonad<U, X>) => ResultMonad<U, X>

  // --- alias ---
  $: ErrMonad<E>['fmap']
  '*': ErrMonad<E>['liftA']
  '>>=': ErrMonad<E>['liftM']
  b: ErrMonad<E>['liftM']
}
