import type { FastifyRequest, FastifyReply } from 'fastify';
import * as v from 'valibot';
import { MemberPayloadSchema, MemberFiltersSchema } from './member.schema';
import * as MemberRepo from './member.repository';
import { AppError } from '../../shared/errors/AppError';
import { HttpStatus } from '../../shared/errors/http-status';

export async function listMembers(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const filters = v.parse(MemberFiltersSchema, request.query);
  const members = await MemberRepo.findAll(filters);
  await reply.status(HttpStatus.OK).send({ members });
}

export async function fetchMember(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const id = Number(request.params.id);
  if (isNaN(id) || id < 1) {
    throw new AppError(HttpStatus.BAD_REQUEST, 'Member ID must be a positive integer');
  }
  const member = await MemberRepo.findById(id);
  if (!member) throw new AppError(HttpStatus.NOT_FOUND, 'Member not found');
  await reply.status(HttpStatus.OK).send(member);
}

export async function createMember(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const payload = v.parse(MemberPayloadSchema, request.body);
  const created = await MemberRepo.insert(payload);
  await reply.status(HttpStatus.CREATED).send(created);
}

export async function modifyMember(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const id = Number(request.params.id);
  if (isNaN(id) || id < 1) {
    throw new AppError(HttpStatus.BAD_REQUEST, 'Member ID must be a positive integer');
  }
  const payload = v.parse(MemberPayloadSchema, request.body);
  const updated = await MemberRepo.update(id, payload);
  await reply.status(HttpStatus.OK).send(updated);
}

export async function removeMember(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const id = Number(request.params.id);
  if (isNaN(id) || id < 1) {
    throw new AppError(HttpStatus.BAD_REQUEST, 'Member ID must be a positive integer');
  }
  await MemberRepo.destroy(id);
  await reply.status(HttpStatus.NO_CONTENT).send();
}
