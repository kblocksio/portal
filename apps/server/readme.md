## Generate Supabase Types

npx supabase gen types typescript --local > src/supabase.types.ts
npx supabase gen types typescript --local --schema private > src/supabase.types.ts

## Other scripts

```sh
npx supabase stop
```

```sh
npx supabase migration up
```

```sh
docker volume rm $(docker volume ls -q --filter label=com.supabase.cli.project=server)
```
