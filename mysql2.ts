import * as dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const conn = await mysql.createConnection(process.env.DATABASE_URL!)

const fooIds = [0, 1, 2]

const read = async () => conn.execute('select * from `foo`').then((_) => _[0])

const updateTxSequence = async (n: number) => {
  await conn.beginTransaction()
  for (const id of fooIds) {
    await conn.execute('update `foo` set `n` = ? where `foo`.`id` = ?', [n, id])
  }
  await conn.commit()
}

const updateTxParallel = async (n: number) => {
  await conn.beginTransaction()
  const promises = fooIds.map((id) =>
    conn.execute('update `foo` set `n` = ? where `foo`.`id` = ?', [n, id])
  )
  await Promise.all(promises)
  await conn.commit()
}

const run = async () => {
  console.log('--- initial records ---')
  console.log(JSON.stringify(await read(), null, 2))
  console.log('--- end ---')

  await updateTxSequence(1)

  console.log('--- records after sequential transaction ---')
  console.log(JSON.stringify(await read(), null, 2))
  console.log('--- end ---')

  await updateTxParallel(2)

  console.log('--- records after parallel transaction ---')
  console.log(JSON.stringify(await read(), null, 2))
  console.log('--- end ---')

  await conn.end()
}

run()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
