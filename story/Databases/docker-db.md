pull postgres -> docker pull postgres

create volume -> docker volume create mernpgdata

run postgres container -> docker run --rm --name mernpg-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -e POSTGRES_DB=mernstack_auth_service -v mernpgdata:/var/lib/postgresql/data -p 5432:5432 -d postgres

> **Note:** If you have a native PostgreSQL installed on macOS (`brew services list`), stop it first to avoid port conflicts:
>
> ```bash
> brew services stop postgresql
> ```
