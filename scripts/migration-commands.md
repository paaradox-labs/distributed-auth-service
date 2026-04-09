# TypeORM migration commands

Commands for this repo use **`typeorm-ts-node-esm`** with the DataSource at **`src/config/data-source.ts`**.

---

## Environment

Set `NODE_ENV` when your config loads `.env.<NODE_ENV>` (for example `.env.dev`).

```bash
NODE_ENV=dev
```

If your app already defaults to the right env file, you can omit it.

---

## `migration:generate`

**Compares** your entities to the **current database** and writes a new migration file with the SQL diff.

| Placeholder     | Meaning                                              |
| --------------- | ---------------------------------------------------- |
| `<output_path>` | Base path for the file (no extension), e.g. `src/migration/rename_tables` |

**Recommended** — avoids pnpm inserting a stray `--` before the path:

```bash
NODE_ENV=dev pnpm exec typeorm-ts-node-esm migration:generate -d src/config/data-source.ts <output_path>
```

**Via `package.json`** — path is the only argument after `--`:

```bash
NODE_ENV=dev pnpm run migration:generate -- <output_path>
```

---

## `migration:run`

Runs **all pending** migrations against the database.

```bash
NODE_ENV=dev pnpm exec typeorm-ts-node-esm migration:run -d src/config/data-source.ts
```

**Via `package.json`** (if this fails because of pnpm/`--`, use the `pnpm exec` line above):

```bash
NODE_ENV=dev pnpm run migration:run -- -d src/config/data-source.ts
```

---

## `migration:create`

Creates an **empty** migration file (no schema diff). Use when you want to write SQL by hand.

| Placeholder     | Meaning                                      |
| --------------- | -------------------------------------------- |
| `<output_path>` | Where the new file should go, e.g. `src/migration/MyMigration` |

```bash
NODE_ENV=dev pnpm exec typeorm-ts-node-esm migration:create <output_path>
```

**Via `package.json`:**

```bash
NODE_ENV=dev pnpm run migration:create -- <output_path>
```

---

## Quick reference

| Goal                         | Command pattern                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Generate migration from diff | `pnpm exec typeorm-ts-node-esm migration:generate -d src/config/data-source.ts <path>` |
| Apply pending migrations     | `pnpm exec typeorm-ts-node-esm migration:run -d src/config/data-source.ts`     |
| Empty migration stub         | `pnpm exec typeorm-ts-node-esm migration:create <path>`                         |
