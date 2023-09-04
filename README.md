# Planetscale serverless: Inconsistent transactions with `Promise.all`

To run the examples:

- Create a `.env` at the root with a `DATABASE_URL` variable containing a Planetscale connection string pointing to an empty Planetscale branch
- Seed your empty Planetscale db using `init.sql`
- Run `pnpm mysql2` to run the example using the `mysql2` driver (see `mysql2.ts`)
- Run `pnpm ps` to run the example using the `@planetscale/database` driver (see `ps.ts`)

Both `ps.ts` and `mysql2.ts` implement a sequential and a parallel transction:

- Sequential: Records are updated sequentially in a for-loop where each update is awaited before the next one can run
- Parallel: An array of record update promises is created and the promises are awaited using `Promise.all`

When you run `pnpm mysql2`, you should see something like the following in your console:

```
--- initial records ---
[
  {
    "id": 0,
    "n": 0
  },
  {
    "id": 1,
    "n": 0
  },
  {
    "id": 2,
    "n": 0
  }
]
--- end ---
--- records after sequential transaction ---
[
  {
    "id": 0,
    "n": 1
  },
  {
    "id": 1,
    "n": 1
  },
  {
    "id": 2,
    "n": 1
  }
]
--- end ---
--- records after parallel transaction ---
[
  {
    "id": 0,
    "n": 2
  },
  {
    "id": 1,
    "n": 2
  },
  {
    "id": 2,
    "n": 2
  }
]
--- end ---
```

When you run `pnpm ps`, you should see something like the following in your console (assuming you ran `pnpm mysql2` first):

```
--- initial records ---
[
  {
    "id": 0,
    "n": 2
  },
  {
    "id": 1,
    "n": 2
  },
  {
    "id": 2,
    "n": 2
  }
]
--- end ---
--- records after sequential transaction ---
[
  {
    "id": 0,
    "n": 3
  },
  {
    "id": 1,
    "n": 3
  },
  {
    "id": 2,
    "n": 3
  }
]
--- end ---
--- records after parallel transaction ---
[
  {
    "id": 0,
    "n": 3
  },
  {
    "id": 1,
    "n": 4
  },
  {
    "id": 2,
    "n": 3
  }
]
--- end ---
```

The sequential transaction works as expected for both drivers.

The parallel transaction works as expected with `mysql2`, however with `@planetscale/database` only a single record gets updated, resulting in a corrupt state that is the opposite of what's intended when using a transaction (i.e. either all updates succeed or all updates fail).
