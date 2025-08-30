import Role from "../role.enum";

const prismaRoles = ['ADMIN', 'MANAGER', 'AGENT', 'VIEWER', 'GUEST'];

describe('Role enum sync', () => {
    it('should match Prisma enum values', () => {
        expect(Object.values(Role).sort()).toEqual(prismaRoles.sort());
    });
});
