import type { FastifyPluginAsync } from 'fastify';
import {
  listMembers,
  fetchMember,
  createMember,
  modifyMember,
  removeMember,
} from './member.handlers';

export const memberPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', listMembers);
  fastify.get('/:id', fetchMember);
  fastify.post('/', createMember);
  fastify.put('/:id', modifyMember);
  fastify.delete('/:id', removeMember);
};
