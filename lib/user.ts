import { query, queryOne } from './db';

export interface User {
  id: number;
  external_id: string;
  email: string;
  username: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export async function findUserByExternalId(externalId: string): Promise<User | null> {
  return await queryOne<User>(
    'SELECT * FROM users WHERE external_id = ?',
    [externalId]
  );
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return await queryOne<User>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );
}

export async function createUser(
  externalId: string,
  email: string,
  username: string,
  name: string
): Promise<User> {
  await query(
    `INSERT INTO users (external_id, email, username, name) 
     VALUES (?, ?, ?, ?)`,
    [externalId, email, username, name]
  );

  const user = await findUserByExternalId(externalId);
  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}

export async function updateUser(
  id: number,
  email: string,
  username: string,
  name: string
): Promise<void> {
  await query(
    `UPDATE users 
     SET email = ?, username = ?, name = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [email, username, name, id]
  );
}

export async function findOrCreateUser(
  externalId: string,
  email: string,
  username: string,
  name: string
): Promise<User> {
  let user = await findUserByExternalId(externalId);

  if (user) {
    // Mettre à jour les informations si elles ont changé
    if (user.email !== email || user.username !== username || user.name !== name) {
      await updateUser(user.id, email, username, name);
      user = await findUserByExternalId(externalId);
    }
  } else {
    user = await createUser(externalId, email, username, name);
  }

  return user!;
}
