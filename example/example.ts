import * as ResultMonad from '../src/main'

const { err, ok, bind, match } = ResultMonad

const double = (x: number) => x * 2

const half = (x: number) => {
  return x / 2
}

const formatError = (x: string) => {
  return `code: ${x}`
}

const hogeErr = (_x: number) => {
  return err('HOGE')
}

const res = ok(42).fmap(double).fmap(console.log)

const res2 = ok(42).apply(ok(double)).fmap(double).fmap(half).chain(hogeErr).fmap(formatError)

console.log(`${res2}`)

const res3 = bind<number, string>(ok(42), x => (x % 2 === 0 ? ok(x) : err('ODD')))

console.log(`${res3}`)

const res4 = match(res3, {
  Err: formatError,
  Ok: ok,
})

console.log(`${res4}`)
