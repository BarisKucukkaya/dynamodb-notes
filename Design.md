# Project Design: Notes App with DynamoDB

## 1. Database Configuration

I am using a Single Table Design.

- **Table Name:** `NotesApp`
- **Partition Key (PK):** `PK` (String)
- **Sort Key (SK):** `SK` (String)
- **GSI:** None

## 2. Entity Relationships

### Database Relationship

We have a **One-to-Many** hierarchical relationship between Users and Notes.

- **Parent:** User (Stored under `PK=USER#<email>`)
- **Child:** Note (Stored under the same `PK`, differentiated by `SK`)

### Entity Fields

- **User:** `id` (UUID), `email`, `name`, `createdAt`.
- **Note:** `id` (UUID), `userId`, `title`, `content`, `deadline`, `createdAt`,`updatedAt`.

## 3. Hot Queries (Pseudo-SQL)

As requested, here is how my queries would look in SQL:

```sql
-- 1. Get User Profile
SELECT * FROM NotesApp WHERE PK = 'USER#ali@test.com' AND SK = 'PROFILE';

-- 2. Get All Notes for User (Ordered by Deadline)
SELECT * FROM NotesApp WHERE PK = 'USER#ali@test.com' AND SK LIKE 'NOTE#%';

-- 3. Filter Notes by Deadline (Due Before)
SELECT * FROM NotesApp WHERE PK = 'USER#ali@test.com' AND SK < 'NOTE#2026-01-20';
```

## 4. Access Patterns

My main goal was to avoid **Scan** operations completely. I designed the keys to support `Query` and `GetItem` for all requirements.

```
| ID    | Goal              | Operation   | Index         | Key Condition                                 | Why                                                         |
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| **1** | Create User       | PutItem     | Primary Table | PK=`USER#email`, SK=`PROFILE`                 | Enforces email uniqueness using attribute_not_exists(PK).   |
| **2** | Get User Profile  | GetItem     | Primary Table | PK=`USER#email`, SK=`PROFILE`                 | Direct O(1) access via Primary Key (Email)                  |
| **3** | Create Note       | PutItem     | Primary Table | PK=`USER#email`, SK=`NOTE#deadline#id`        | Groups notes under user; prepares SK for date sorting       |
| **4** | Get All Notes     | Query       | Primary Table | PK=`USER#email` AND begins_with(SK, "NOTE#")  | Efficiently fetches data (Query) without scanning the table |
| **5** | Notes Due Before  | Query       | Primary Table | PK=`USER#email` AND SK < `NOTE#target_date`   | Utilizes sorted Sort Key for efficient range (<) query      |
| **6** | Notes Due After   | Query       | Primary Table | PK=`USER#email` AND SK > `NOTE#target_date`   | Utilizes sorted Sort Key for efficient range (>) query      |
| **7** | Update Note       | UpdateItem  | Primary Table | PK=`USER#email`, SK=`NOTE#deadline#id`        | Direct update. (But Deadline changes require delete+create) |
| **8** | Delete Note       | DeleteItem  | Primary Table | PK=`USER#email`, SK=`NOTE#deadline#id`        | Direct deletion using the specific Primary Key              |
```

## 5. How I Handled Uniqueness (Email)

To make sure two users cannot use the same email, I didn't check it in the Node.js code. Instead, I used DynamoDB's consistency features.

- Since the `PK` is `USER#<email>`, duplicate emails would try to write to the exact same key.
- I use the condition `attribute_not_exists(PK)` when creating a user.
- If the key exists, DynamoDB throws an error, and I handle it in the backend.

## 6. Design Decisions & Trade-offs

Here is why I chose this structure and the limitations I found:

### Why Email in PK?

- **Pros:** It is very easy to find a user (`GetItem`). It automatically solves the "Unique Email" requirement.
- **Cons:** If a user wants to change their email, I have to delete the old record and create a new one. I cannot just "update" the PK.

### Why Deadline in SK?

- **Pros:** It allows me to find "Notes due before date" using a fast `Query` (using `<` operator).
- **Cons:** If I update the deadline of a note, the SK changes. So, I have to delete the old note and create a new one. This makes the "Update Note" logic a bit more complex.
