/**
 * Implémentation MySQL du repository User
 */

import { query, queryOne } from '@/lib/db';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';

interface UserRow {
  id: number;
  external_id: string;
  name: string;
  email: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export class MySQLUserRepository implements UserRepository {
  private toEntity(row: UserRow): UserEntity {
    return new UserEntity(
      row.id,
      row.external_id,
      row.name,
      row.email,
      row.username,
      row.created_at,
      row.updated_at
    );
  }

  async findById(id: number): Promise<UserEntity | null> {
    const row = await queryOne<UserRow>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return row ? this.toEntity(row) : null;
  }

  async findByExternalId(externalId: string): Promise<UserEntity | null> {
    const row = await queryOne<UserRow>(
      'SELECT * FROM users WHERE external_id = ?',
      [externalId]
    );
    return row ? this.toEntity(row) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const row = await queryOne<UserRow>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return row ? this.toEntity(row) : null;
  }

  async findAll(): Promise<UserEntity[]> {
    const rows = await query<UserRow>(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    return rows.map(row => this.toEntity(row));
  }

  async create(data: {
    external_id: string;
    name: string;
    email: string;
    username: string;
  }): Promise<UserEntity> {
    const result: any = await query(
      `INSERT INTO users (external_id, name, email, username)
       VALUES (?, ?, ?, ?)`,
      [data.external_id, data.name, data.email, data.username]
    );
    const userId = result.insertId;
    return (await this.findById(userId))!;
  }

  async update(
    userId: number,
    data: {
      name?: string;
      email?: string;
      username?: string;
    }
  ): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }

    if (data.username !== undefined) {
      updates.push('username = ?');
      values.push(data.username);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      values.push(userId);
      await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async delete(userId: number): Promise<void> {
    await query('DELETE FROM users WHERE id = ?', [userId]);
  }

  async upsert(data: {
    external_id: string;
    name: string;
    email: string;
    username: string;
  }): Promise<UserEntity> {
    // Try to find existing user
    const existingUser = await this.findByExternalId(data.external_id);

    if (existingUser) {
      // Update existing user
      await this.update(existingUser.id, {
        name: data.name,
        email: data.email,
        username: data.username
      });
      return (await this.findById(existingUser.id))!;
    } else {
      // Create new user
      return await this.create(data);
    }
  }
}
