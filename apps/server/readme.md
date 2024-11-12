# Server

```sh
npx dotenv -- npx supabase start
open http://localhost:54323/
```

```sh
npx supabase status --env
npx supabase status --json
```

```sh
npx supabase gen types typescript --local > src/supabase.types.ts
```

```sh
npx supabase db reset
```

---

```sh
open http://localhost:3001/api/auth/sign-in
```
