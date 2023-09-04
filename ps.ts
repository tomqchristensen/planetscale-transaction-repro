import { connect } from '@planetscale/database'
import * as dotenv from 'dotenv'

dotenv.config()

const conn = connect({
  url: process.env.DATABASE_URL!,
})

const fooIds = [0, 1, 2]

const read = async () => conn.execute('select * from `foo`').then((_) => _.rows)

const updateTxSequence = async (n: number) =>
  conn.transaction(async (tx) => {
    for (const id of fooIds) {
      await tx.execute('update `foo` set `n` = ? where `foo`.`id` = ?', [n, id])
    }
  })

const updateTxParallel = async (n: number) =>
  conn.transaction(async (tx) => {
    const promises = fooIds.map((id) =>
      tx.execute('update `foo` set `n` = ? where `foo`.`id` = ?', [n, id])
    )
    await Promise.all(promises)
  })

const run = async () => {
  console.log('--- initial records ---')
  console.log(JSON.stringify(await read(), null, 2))
  console.log('--- end ---')

  await updateTxSequence(3)

  console.log('--- records after sequential transaction ---')
  console.log(JSON.stringify(await read(), null, 2))
  console.log('--- end ---')

  await updateTxParallel(4)

  console.log('--- records after parallel transaction ---')
  console.log(JSON.stringify(await read(), null, 2))
  console.log('--- end ---')
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
