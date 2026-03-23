pull postgres -> docker pull postgres

create volume -> docker volume create mernpgdata

run postgres container -> docker run --rm --name mernpg-container -e POSTGRES_USER=root -e POSTGRES_PASSWORD=root -v mernpgdata:/var/lib/postgresql -p 5432:5432 -d postgres
