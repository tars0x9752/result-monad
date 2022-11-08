import { err, ok, bind, match, defaultValue, defaultWith, isErr, isOk, satisfy } from '../src/main'
import type { Result } from '../src/main'

type CustomError = {
  code: string
  message: string
}

const head = <T>(arr: T[]): Result<T, CustomError> => {
  if (arr.length <= 0) {
    return err({
      code: 'EMPTY_LIST',
      message: 'empty list error',
    })
  }

  return ok(arr[0])
}

const double = (x: number) => x * 2

const showError = (e: CustomError) => `${e.code}: ${e.message}`

function main() {
  /**
   * --- example 1 ---
   */

  const res = head([21, 123, 321])

  if (res.is_Err) {
    // res is inferred as Err<CustomError> here!
    res.fmap(showError).fmap(console.log)
    return
  }

  // res is inferred as Ok<number>
  res.fmap(double).fmap(console.log) // 42

  const isResEven = satisfy(res, num => num % 2 === 0) // false

  const val = res.val // 21
}

main()
