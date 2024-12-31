/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export interface Group {
  bg_color: string;
  id: Generated<number>;
  name: string;
  text_color: string;
}

export interface GroupPermissions {
  group_id: number;
  permission: string;
}

export interface Invitation {
  code: string;
  created_at: Generated<Date>;
  id: Generated<number>;
  user_id: number;
}

export interface User {
  firstname: string;
  id: Generated<number>;
  lastname: string;
  password: string;
  username: string;
}

export interface UserGroup {
  group_id: number;
  user_id: number;
}

export interface DB {
  group: Group;
  group_permissions: GroupPermissions;
  invitation: Invitation;
  user: User;
  user_group: UserGroup;
}
