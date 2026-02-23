import { db } from '../../db/client';
import type { MemberPayload, MemberFilters } from './member.schema';

export async function findAll(filters: MemberFilters) {
  return db.member.findMany({
    where: {
      ...(filters.fullName ? { fullName: { contains: filters.fullName, mode: 'insensitive' } } : {}),
      ...(filters.email ? { email: { contains: filters.email, mode: 'insensitive' } } : {}),
    },
    orderBy: { id: 'asc' },
  });
}

export async function findById(id: number) {
  return db.member.findUnique({ where: { id } });
}

export async function insert(payload: MemberPayload) {
  return db.member.create({ data: payload });
}

export async function update(id: number, payload: MemberPayload) {
  return db.member.update({ where: { id }, data: payload });
}

export async function destroy(id: number) {
  return db.member.delete({ where: { id } });
}
